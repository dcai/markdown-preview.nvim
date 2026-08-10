local M = {}

function M.check()
  vim.health.info('Nvim version: ' .. vim.inspect(vim.version()))

  local node = vim.fn.exepath('node')
  if node == '' then
    vim.health.error('Node.js executable not found')
    return
  end

  vim.health.info('Node path: ' .. node)
  vim.health.info('Node version: ' .. vim.trim(vim.fn.system({ node, '--version' })))
  local script = vim.fn.fnamemodify(debug.getinfo(1, 'S').source:sub(2), ':h:h:h') .. '/app/index.js'
  vim.health.info('Script: ' .. script)
  vim.health.info('Script exists: ' .. vim.fn.filereadable(script))
  vim.health.ok('Using Node.js')
end

return M
