let s:mkdp_root_dir = expand('<sfile>:h:h:h')

function! health#mkdp#check() abort
  lua vim.health.info("Nvim Version: " .. string.gsub(vim.fn.system('nvim --version'), '^%s*(.-)%s*$', '%1'))
  let l:node = exepath('node')
  if empty(l:node)
    lua vim.health.error('Node.js executable not found')
    return
  endif
  let l:node_version = system(shellescape(l:node) . ' --version')
  lua vim.health.info('Node path: ' .. vim.api.nvim_eval('l:node'))
  lua vim.health.info('Node version: ' .. string.gsub(vim.api.nvim_eval('l:node_version'), '^%s*(.-)%s*$', '%1'))
  let l:mkdp_server_script = s:mkdp_root_dir .. '/app/server.js'
  lua vim.health.info('Script: ' .. vim.api.nvim_eval('l:mkdp_server_script'))
  lua vim.health.info('Script exists: ' .. vim.fn.filereadable(vim.api.nvim_eval('l:mkdp_server_script')))
  lua vim.health.ok('Using Node.js')
endfunction
