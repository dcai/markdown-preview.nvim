import { attach, type Attach, type Neovim } from '@chemzqm/neovim'
interface IApp {
  refreshPage: ((
    param: {
      bufnr: number | string
      data: any
    }
  ) => void)
  closePage: ((
    params: {
      bufnr: number | string
    }
  ) => void)
  closeAllPages: (() => void)
  openBrowser: ((
    params: {
      bufnr: number | string
    }
  ) => void)
}

interface IPlugin {
  init: ((app: IApp) => void)
  nvim: Neovim
}

let app: IApp

export default function(options: Attach): IPlugin {
  const nvim: Neovim = attach(options)

  nvim.on('notification', async (method: string, args: any[]) => {
    const opts = args[0] || args
    const bufnr = opts.bufnr
    const buffers = await nvim.buffers
    const buffer = buffers.find(b => b.id === bufnr)
    if (method === 'refresh_content' && buffer) {
      const winline = await nvim.call('winline')
      const currentWindow = await nvim.window
      const winheight = await nvim.call('winheight', currentWindow.id)
      const cursor = await nvim.call('getpos', ['.'])
      const config = await nvim.executeLua('return require("mkdp").get_config()')
      const renderOpts = config.preview_options
      const pageTitle = config.page_title
      const theme = config.theme
      const name = await buffer.name
      const content = await buffer.getLines()
      const currentBuffer = await nvim.buffer
      app.refreshPage({
        bufnr,
        data: {
          options: renderOpts,
          isActive: currentBuffer.id === buffer.id,
          winline,
          winheight,
          cursor,
          pageTitle,
          theme,
          name,
          content
        }
      })
    } else if (method === 'close_page') {
      app.closePage({
        bufnr
      })
    } else if (method === 'open_browser') {
      app.openBrowser({
        bufnr
      })
    }
  })

  nvim.on('request', (method: string, args: any, resp: any) => {
    if (method === 'close_all_pages') {
      app.closeAllPages()
    }
    resp.send()
  })

  return {
    nvim,
    init: (param: IApp) => {
      app = param
    }
  }
}
