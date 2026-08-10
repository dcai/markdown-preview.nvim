local M = {}

local root = vim.fn.fnamemodify(debug.getinfo(1, 'S').source:sub(2), ':h:h:h')
local channel_id

local default_preview_options = {
  mkit = {},
  katex = {},
  uml = {},
  maid = {},
  disable_sync_scroll = 0,
  sync_scroll_type = 'middle',
  hide_yaml_meta = 1,
  sequence_diagrams = {},
  flowchart_diagrams = {},
  content_editable = false,
  disable_filename = 0,
  toc = {},
}

local defaults = {
  auto_start = false,
  auto_close = true,
  refresh_slow = false,
  command_for_global = false,
  open_to_the_world = false,
  open_ip = '',
  echo_preview_url = false,
  browser = '',
  markdown_css = '',
  highlight_css = '',
  port = nil,
  page_title = '「${name}」',
  filetypes = { 'markdown' },
  images_path = '',
  combine_preview = false,
  combine_preview_auto_refresh = true,
  clients_active = false,
}

M.config = vim.deepcopy(defaults)
M.open_callback = nil

local function is_enabled_buffer(bufnr)
  return M.config.command_for_global
    or vim.tbl_contains(M.config.filetypes, vim.bo[bufnr].filetype)
end

local function clear_buffer_autocmds(bufnr)
  vim.api.nvim_create_augroup('MKDP_REFRESH_INIT' .. bufnr, { clear = true })
end

function M.echo_messages(highlight, messages)
  local level = highlight == 'Error' and vim.log.levels.ERROR or vim.log.levels.INFO
  for _, message in ipairs(type(messages) == 'table' and messages or { messages }) do
    if message ~= '' then
      vim.notify(message, level)
    end
  end
end

function M.echo_url(url)
  M.echo_messages('Type', 'Preview page: ' .. url)
end

function M.get_config()
  return M.config
end

function M.set_clients_active(active)
  M.config.clients_active = active
end

function M.open_url(url)
  if not M.open_callback then
    return false
  end
  M.open_callback(url)
  return true
end

local function server_status()
  return channel_id and 1 or -1
end

function M.start_server()
  if server_status() == 1 then
    return
  end

  local node = vim.fn.exepath('node')
  if node == '' then
    M.echo_messages('Error', 'Node.js executable not found')
    return
  end

  channel_id = vim.fn.jobstart({ node, root .. '/app/index.js' }, {
    rpc = true,
    on_stdout = function(_, messages)
      M.echo_messages('Error', messages)
    end,
    on_stderr = function(_, messages)
      M.echo_messages('Error', messages)
    end,
    on_exit = function()
      channel_id = nil
    end,
  })

  if channel_id <= 0 then
    channel_id = nil
    M.echo_messages('Error', 'Failed to start markdown-preview.nvim server')
  end
end

function M.stop_server()
  if channel_id then
    vim.rpcrequest(channel_id, 'close_all_pages')
    vim.fn.jobstop(channel_id)
    channel_id = nil
  end
  vim.b.MarkdownPreviewToggleBool = false
end

function M.preview_refresh()
  if channel_id then
    vim.rpcnotify(channel_id, 'refresh_content', { bufnr = vim.api.nvim_get_current_buf() })
  end
end

function M.preview_close()
  if channel_id then
    vim.rpcnotify(channel_id, 'close_page', { bufnr = vim.api.nvim_get_current_buf() })
  end
  vim.b.MarkdownPreviewToggleBool = false
  clear_buffer_autocmds(vim.api.nvim_get_current_buf())
end

function M.open_browser()
  if channel_id then
    vim.rpcnotify(channel_id, 'open_browser', { bufnr = vim.api.nvim_get_current_buf() })
  end
  M.init_buffer_autocmds()
end

function M.open_preview_page()
  if server_status() == -1 then
    M.start_server()
  else
    M.open_browser()
  end
end

function M.combine_preview_refresh()
  if M.config.clients_active and not M.config.auto_start then
    M.open_browser()
  end
end

function M.stop_preview()
  M.config.clients_active = false
  M.stop_server()
end

function M.toggle_preview()
  if not vim.b.MarkdownPreviewToggleBool then
    M.open_preview_page()
    vim.b.MarkdownPreviewToggleBool = true
  else
    M.stop_preview()
    vim.b.MarkdownPreviewToggleBool = false
  end
end

function M.init_buffer_autocmds()
  local bufnr = vim.api.nvim_get_current_buf()
  local group = vim.api.nvim_create_augroup('MKDP_REFRESH_INIT' .. bufnr, { clear = true })
  local events = M.config.refresh_slow
      and { 'CursorHold', 'BufWrite', 'InsertLeave' }
    or { 'CursorHold', 'CursorHoldI', 'CursorMoved', 'CursorMovedI' }

  vim.api.nvim_create_autocmd(events, {
    group = group,
    buffer = bufnr,
    callback = M.preview_refresh,
  })
  if M.config.auto_close then
    vim.api.nvim_create_autocmd('BufHidden', {
      group = group,
      buffer = bufnr,
      callback = M.preview_close,
    })
  end
end

local function init_commands(args)
  local bufnr = args.buf
  if not is_enabled_buffer(bufnr) then
    return
  end

  for name, callback in pairs({
    MarkdownPreview = M.open_preview_page,
    MarkdownPreviewStop = M.stop_preview,
    MarkdownPreviewToggle = M.toggle_preview,
  }) do
    vim.api.nvim_buf_create_user_command(bufnr, name, callback, {})
  end

  local options = { buffer = bufnr, silent = true }
  vim.keymap.set('n', '<Plug>MarkdownPreview', '<Cmd>MarkdownPreview<CR>', options)
  vim.keymap.set('i', '<Plug>MarkdownPreview', '<Esc><Cmd>MarkdownPreview<CR>a', options)
  vim.keymap.set('n', '<Plug>MarkdownPreviewStop', '<Cmd>MarkdownPreviewStop<CR>', options)
  vim.keymap.set('i', '<Plug>MarkdownPreviewStop', '<Esc><Cmd>MarkdownPreviewStop<CR>a', options)
  vim.keymap.set('n', '<Plug>MarkdownPreviewToggle', '<Cmd>MarkdownPreviewToggle<CR>', options)
  vim.keymap.set('i', '<Plug>MarkdownPreviewToggle', '<Esc><Cmd>MarkdownPreviewToggle<CR>a', options)
end

function M.setup(options)
  local config = vim.tbl_deep_extend('force', {}, options or {})
  if config.open ~= nil and type(config.open) ~= 'function' then
    error('mkdp.setup: open must be a function')
  end
  M.open_callback = config.open
  config.open = nil
  M.config = vim.tbl_deep_extend('force', vim.deepcopy(defaults), config)
  M.config.preview_options = vim.tbl_deep_extend(
    'force',
    vim.deepcopy(default_preview_options),
    M.config.preview_options or {}
  )

  local group = vim.api.nvim_create_augroup('mkdp_init', { clear = true })
  vim.api.nvim_create_autocmd({ 'BufEnter', 'FileType' }, {
    group = group,
    callback = init_commands,
  })
  vim.api.nvim_create_autocmd('BufEnter', {
    group = group,
    callback = function(args)
      if not is_enabled_buffer(args.buf) then
        return
      end
      if M.config.auto_start then
        M.open_preview_page()
      end
      if M.config.combine_preview and M.config.combine_preview_auto_refresh then
        M.combine_preview_refresh()
      end
    end,
  })
  vim.api.nvim_create_autocmd('VimLeave', {
    group = group,
    callback = M.stop_server,
  })
  init_commands({ buf = vim.api.nvim_get_current_buf() })
end

return M
