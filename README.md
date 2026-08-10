<h1 align="center"> ✨ Markdown Preview for Neovim ✨ </h1>

> Powered by ❤️

### Introduction

> It requires Neovim and Node.js 24 or newer.

Preview Markdown in your modern browser with synchronised scrolling and flexible configuration.

### This fork

This is a fork of [iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim). It keeps the familiar Vim commands and preview features, while simplifying the project for local, modern Node.js development.

Differences from upstream:

- Requires Neovim; Vim 8 support and its RPC compatibility layer are removed.
- Uses a Lua plugin entrypoint and `require('mkdp').setup({...})` configuration. Legacy `g:mkdp_*` options are removed.
- Requires Node.js 24 or newer and npm.
- Uses one root `package.json` and npm lockfile. Yarn support and duplicate app manifests are removed.
- Runs the local Node.js runtime directly. Prebuilt `pkg` binaries, binary downloads, and release-packaging scripts are removed.
- Uses Vite to build the static React preview instead of Next.js.
- Commits the built browser preview (`app/out/`) and bundled Node runtime (`app/runtime/`), so plugin-manager installs need no npm install step.
- Removes the legacy `sequence-diagrams` renderer and its old browser dependencies. Mermaid sequence diagrams are still supported.
- Uses current Node/React/Vite, Socket.IO, and Markdown-It dependencies, and Node's built-in TypeScript type stripping instead of a TypeScript compilation step.

Main features:

- Cross platform (MacOS/Linux/Windows)
- Synchronised scrolling
- Fast asynchronous updates
- [KaTeX](https://github.com/Khan/KaTeX) for typesetting of math
- [PlantUML](https://github.com/plantuml/plantuml)
- [Mermaid](https://github.com/knsv/mermaid)
- [Chart.js](https://github.com/chartjs/Chart.js)
- [Flowchart](https://github.com/adrai/flowchart.js)
- [dot](https://github.com/mdaines/viz.js)
- [Table of contents](https://github.com/nagaozen/markdown-it-toc-done-right)
- Emojis
- Task lists
- Local images
- Flexible configuration

**Note** the plugin `mathjax-support-for-mkdp` is not needed for typesetting math.

![animation of Markdown Preview with its own README.md](https://user-images.githubusercontent.com/5492542/47603494-28e90000-da1f-11e8-9079-30646e551e7a.gif)

### Installation & Usage

Install with [lazy.nvim](https://github.com/folke/lazy.nvim):

Add this in your `init.lua or plugins.lua`

```lua
{
  "dcai/markdown-preview.nvim",
  cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
  config = function()
    require('mkdp').setup({ filetypes = { 'markdown' } })
  end,
  ft = { "markdown" },
},

```
Or with [Packer.nvim](https://github.com/wbthomason/packer.nvim):

Add this in your `init.lua or plugins.lua`

```lua
use({ "dcai/markdown-preview.nvim", config = function() require('mkdp').setup({ filetypes = { 'markdown' } }) end })
```

Or clone it into Neovim's package directory:

```sh
cd ~/.local/share/nvim/site/pack/packer/start/
git clone https://github.com/dcai/markdown-preview.nvim.git
cd markdown-preview.nvim
```

Please make sure that you have installed Node.js 24 or newer. No npm install is needed to use the committed build artifacts.

For development, install dependencies and regenerate both committed bundles:

```bash
npm install
npm run build
```

### MarkdownPreview Config:

```lua
require('mkdp').setup({
  auto_start = false,
  auto_close = true,
  refresh_slow = false,
  command_for_global = false,
  open_to_the_world = false,
  open_ip = '',
  browser = '',
  open = function(url)
    vim.ui.open(url)
  end,
  echo_preview_url = false,
  preview_options = {
    mkit = {}, katex = {}, uml = {}, maid = {},
    disable_sync_scroll = 0, sync_scroll_type = 'middle',
    hide_yaml_meta = 1, flowchart_diagrams = {},
    content_editable = false, disable_filename = 0, toc = {},
  },
  markdown_css = '',
  highlight_css = '',
  port = nil,
  page_title = '「${name}」',
  images_path = '/home/user/.markdown_images',
  filetypes = { 'markdown' },
  theme = 'dark',
  combine_preview = false,
  combine_preview_auto_refresh = true,
})
```

Mappings:

```lua
vim.keymap.set('n', '<C-s>', '<Plug>MarkdownPreview')
vim.keymap.set('n', '<M-s>', '<Plug>MarkdownPreviewStop')
vim.keymap.set('n', '<C-p>', '<Plug>MarkdownPreviewToggle')
```

Commands:

```text
" Start the preview
:MarkdownPreview

" Stop the preview"
:MarkdownPreviewStop
```

### Custom Examples

**Table of contents**

> one of

    ${toc}
    [[toc]]
    [toc]
    [[_toc_]]

**Image Size:**

``` markdown
![image](https://user-images.githubusercontent.com/5492542/47603494-28e90000-da1f-11e8-9079-30646e551e7a.gif =400x200)
```

**PlantUML:**

    @startuml
    Bob -> Alice : hello
    @enduml

Or

    ``` plantuml
    Bob -> Alice : hello
    ```

**KaTeX:**

    $\sqrt{3x-1}+(1+x)^2$

    $$\begin{array}{c}

    \nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &
    = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\

    \nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\

    \nabla \cdot \vec{\mathbf{B}} & = 0

    \end{array}$$

**mermaid:**

    ``` mermaid
    gantt
        dateFormat DD-MM-YYY
        axisFormat %m/%y

        title Example
        section example section
        activity :active, 01-02-2019, 03-08-2019
    ```

**Flowchart:**

    ``` flowchart
    st=>start: Start|past:>http://www.google.com[blank]
    e=>end: End|future:>http://www.google.com
    op1=>operation: My Operation|past
    op2=>operation: Stuff|current
    sub1=>subroutine: My Subroutine|invalid
    cond=>condition: Yes
    or No?|approved:>http://www.google.com
    c2=>condition: Good idea|rejected
    io=>inputoutput: catch something...|future

    st->op1(right)->cond
    cond(yes, right)->c2
    cond(no)->sub1(left)->op1
    c2(yes)->io->e
    c2(no)->op2->e
    ```

**dot:**

    ``` dot
    digraph G {

      subgraph cluster_0 {
        style=filled;
        color=lightgrey;
        node [style=filled,color=white];
        a0 -> a1 -> a2 -> a3;
        label = "process #1";
      }

      subgraph cluster_1 {
        node [style=filled];
        b0 -> b1 -> b2 -> b3;
        label = "process #2";
        color=blue
      }
      start -> a0;
      start -> b0;
      a1 -> b3;
      b2 -> a3;
      a3 -> a0;
      a3 -> end;
      b3 -> end;

      start [shape=Mdiamond];
      end [shape=Msquare];
    }
    ```

**chart:**

    ``` chart
    {
      "type": "pie",
      "data": {
        "labels": [
          "Red",
          "Blue",
          "Yellow"
        ],
        "datasets": [
          {
            "data": [
              300,
              50,
              100
            ],
            "backgroundColor": [
              "#FF6384",
              "#36A2EB",
              "#FFCE56"
            ],
            "hoverBackgroundColor": [
              "#FF6384",
              "#36A2EB",
              "#FFCE56"
            ]
          }
        ]
      },
      "options": {}
    }
    ```

### FAQ

#### *Why is the synchronised scrolling lagging?*

Set `updatetime` to a small number, for instance: `set updatetime=100`

*WSL 2 issue*: Can not open browser when using WSL 2 with terminal Vim.

> if you are using Ubuntu you can install xdg-utils using `sudo apt-get install -y xdg-utils`
> checkout [issue 199](https://github.com/iamcco/markdown-preview.nvim/issues/199) for more detail.

#### *How can I change the dark/light theme?*

The default theme is based on your system preferences.
There is a button hidden in the header to change the theme. Place your mouse over the header to reveal it.

#### *How can I pass CLI options to the browser, like opening in a new window?*

Answer: Add the following to your Neovim init script:

Set `browser` in `require('mkdp').setup()` to your browser executable. For browser-specific CLI flags, use a shell wrapper as that executable.

### References

- [coc.nvim](https://github.com/neoclide/coc.nvim)
- [@chemzqm/neovim](https://github.com/neoclide/neovim)
- [chart.js](https://github.com/chartjs/Chart.js)
- [highlight](https://github.com/highlightjs/highlight.js)
- [neovim/node-client](https://github.com/neovim/node-client)
- [markdown.css](https://github.com/iamcco/markdown.css)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [markdown-it-katex](https://github.com/waylonflinn/markdown-it-katex)
- [markdown-it-plantuml](https://github.com/gmunguia/markdown-it-plantuml)
- [markdown-it-chart](https://github.com/tylingsoft/markdown-it-chart)
- [mermaid](https://github.com/knsv/mermaid)
- [opener](https://github.com/domenic/opener)
- [socket.io](https://github.com/socketio/socket.io)

### Buy Me A Coffee ☕️

![btc](https://img.shields.io/keybase/btc/iamcco.svg?style=popout-square)

![WeChat and AliPay](https://user-images.githubusercontent.com/5492542/42771079-962216b0-8958-11e8-81c0-520363ce1059.png)
