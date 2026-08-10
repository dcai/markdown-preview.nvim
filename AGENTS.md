# AGENTS.md — markdown-preview.nvim

A Neovim/Vim plugin that previews Markdown in a browser via a Node.js HTTP/WebSocket server with synchronized scrolling.

## Build Commands

All commands run from the repo root.

```bash
# Install the pinned Node.js toolchain
mise install

# Install development dependencies (run once)
npm install

# Install only server runtime dependencies for plugin-manager installs
npm install --omit=dev

# Syntax-check Node-executed TypeScript
npm run lint

# Build the Vite frontend (app/ -> app/out/)
npm run build-app

# Full local build
npm run build

# `lint` uses Node.js syntax checks. There is no separate ESLint/TSLint setup.

# Run the plugin manually in Neovim (from the repo root)
nvim -u test/init.vim test/test.md
```

There is no automated test runner or test framework in this repository, so there is no single-test command. Use the manual Neovim fixture above for VimL/RPC/browser integration checks. When testing frontend rendering, run `npm run build-app` and then exercise the preview from Neovim.

## Development Boundaries

- Node 24+ runs the erasable TypeScript under `src/` directly. Keep runtime imports explicit, including the `.ts` extension for project-owned modules.
- Edit the browser app under `app/pages/`; `npm run build-app` regenerates the static export in `app/out/`.
- `app/out/` is a build artifact. Do not hand-edit generated output; regenerate it when source changes require it.
- This repository has one root `package.json` and lockfile. Runtime dependencies stay in `dependencies`; frontend build dependencies stay in `devDependencies` because the generated `app/out/` is committed.
- Use Vite for the browser build. The app is a single static React page served by `app/server.js`; it has no SSR, API routes, or framework routing needs.
- Plugin-manager installs must run `npm install --omit=dev` from the repository root. `app/index.js` resolves those root dependencies by walking up from `app/`.
- Do not add a nested `app/package.json` or lockfile. It duplicates the dependency graph and can leave app-only installs missing a runtime dependency.
- Node.js is managed by `mise.toml`; use `mise install` rather than nvm. Run commands through `mise exec -- ...` when the current shell is not mise-activated.

## Architecture Overview

The plugin has three layers that communicate via RPC (msgpack over stdio) and WebSocket (socket.io):

```
Vim/Neovim  --RPC (stdio)-->  Node Server  --WebSocket-->  Browser
  (VimL)                        (server.js)               (React)
```

### Layer 1: VimL (plugin entry point and RPC bridge)

- **`plugin/mkdp.vim`** — Defines user-facing commands (`:MarkdownPreview`, `:MarkdownPreviewStop`, `:MarkdownPreviewToggle`), `<Plug>` mappings, and initializes autocommands. All `g:mkdp_*` config variables are defaulted here.
- **`autoload/mkdp/util.vim`** — Orchestrates preview lifecycle: starts/stops the Node server process, manages install/download of pre-built binaries, platform detection.
- **`autoload/mkdp/rpc.vim`** — Manages the Node child process as a Vim/Neovim job. Sends `rpcnotify`/`rpcrequest` calls (`refresh_content`, `close_page`, `open_browser`, `close_all_pages`) over stdio JSON channel.
- **`autoload/mkdp/autocmd.vim`** — Sets up buffer-local autocommands for cursor-movement-triggered refresh (or save-only if `g:mkdp_refresh_slow = 1`) and auto-close on buffer hide.
- **`autoload/nvim/api.vim`** — Neovim API polyfill for plain Vim 8. Uses `textprop` for highlights. Only loaded when not running Neovim.

### Layer 2: Node.js Server (the RPC target and HTTP/WS server)

Entry: **`app/index.js`** -> **`app/server.js`**

The server uses normal Node.js module resolution from the root `node_modules/` directory; do not reintroduce the old VM module loader or dependency preloading layer.

- **`src/attach/index.ts`** — Attaches to Neovim via `@chemzqm/neovim` RPC. Handles incoming notifications (`refresh_content`, `close_page`, `open_browser`) and requests (`close_all_pages`). Reads buffer content and Vim variables, then delegates to the app's `refreshPage`/`closePage`/`openBrowser` callbacks.
- **`app/server.js`** — Creates HTTP server + socket.io WebSocket server. The HTTP server uses `app/routes.js` for routing. WebSocket connections are keyed by `bufnr` and receive `refresh_content` events. Handles browser opening (custom function or default system browser).
- **`app/routes.js`** — Simple middleware chain serving: preview pages (`/page/:bufnr` -> `out/index.html`), Vite build assets (`/assets/*`), custom user CSS overrides, static assets (`/_static/*`), local images (`/_local_image_/*` resolved relative to the markdown file's directory), and 404 fallback.
- **`app/nvim.js`** — Bootstraps the RPC attach, sets up global error handlers that report back to Vim via `mkdp#util#echo_messages`.

### Layer 3: Browser (Vite React app)

- **`app/pages/index.jsx`** — The single preview page. Connects via socket.io, receives markdown content and cursor position, renders with markdown-it using ~15 plugins (KaTeX, mermaid, PlantUML, chart.js, sequence diagrams, flowcharts, dot/graphviz, emoji, task lists, footnotes, TOC, anchors, image sizing, line numbers). Handles synchronized scrolling and theme toggling.
- **`app/pages/*.js`** — Individual markdown-it plugin wrappers (katex, mermaid, chart, plantuml, flowchart, dot, image, scroll, meta, linenumbers, markdown-it-imsize, utils, blockPlantuml). Each exports a markdown-it plugin function and optionally a post-render function.
- **`app/_static/`** — Vendored JS/CSS for browser-side rendering (KaTeX, mermaid, highlight.js, flowchart.js, viz.js, raphael, etc.). Loaded as browser globals by `app/index.html`.
- **`app/index.html`** and **`app/main.jsx`** — Vite entry point and React mount. Static CSS and browser scripts remain in `app/_static/` and are loaded by `index.html`.
- **`app/out/`** — Vite build output. Committed to repo. Generated by `npm run build-app`.

## Key Patterns

- **Local runtime**: `autoload/mkdp/rpc.vim:start_server()` resolves the Node executable with Vim's `exepath('node')` and starts `app/index.js`.
- **Per-buffer preview**: Each buffer gets its own browser page and WebSocket connection keyed by `bufnr`. The `g:mkdp_combine_preview` option reuses a single browser tab across buffers.
- **Config flow**: All config is read from Vim global variables (`g:mkdp_*`) at request time by the Node server via RPC, not passed at startup.
- **No framework router**: Vite builds static assets only. Actual HTTP routing is handled by the custom middleware in `app/routes.js`.

## Updating Mermaid

The vendored mermaid bundle lives at `app/_static/mermaid.min.js`. To update:

```bash
# Check latest version
npm view mermaid version

# Download the file directly from npm via unpkg (npm's CDN for individual files)
curl -L https://unpkg.com/mermaid@$(npm view mermaid version)/dist/mermaid.min.js -o app/_static/mermaid.min.js
git commit -am 'fix: update mermaid to 11.14.0'; git push;
```

After updating, verify the preview still renders mermaid diagrams correctly — mermaid occasionally changes default behavior between minor versions (e.g. theme initialization, `mermaid.init()` API). The integration point is `app/pages/index.jsx` which calls `mermaid.initialize()` and `mermaid.init()` after each content refresh.

## Code Style

- TypeScript: Node 24+ strips erasable type syntax at runtime. Keep the existing no-semicolon, single-quote style.
- `npm run lint` syntax-checks the Node-executed TypeScript files.
- VimL: standard Vim 8 / Neovim compatible, uses `function()` (not `def func()`)
- React: class components (not hooks), built by Vite from `app/index.html` and `app/main.jsx`.
