const fs = require('node:fs')
const path = require('node:path')
const logger = require('../src/util/logger.ts').default('app/routes')

const OUT_DIR = path.join(__dirname, 'out')
const STATIC_DIR = path.join(__dirname, '_static')
const routes = []

const contentTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

const isFile = filePath => {
  try {
    return fs.statSync(filePath).isFile()
  } catch {
    return false
  }
}

const resolveWithin = (root, requestPath) => {
  try {
    const rootPath = path.resolve(root)
    const filePath = path.resolve(rootPath, `.${decodeURIComponent(requestPath)}`)
    const relativePath = path.relative(rootPath, filePath)

    if (
      relativePath === '' ||
      relativePath === '..' ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath)
    ) {
      return null
    }

    return filePath
  } catch {
    return null
  }
}

const sendFile = (res, filePath) => {
  const contentType = contentTypes[path.extname(filePath).toLowerCase()]
  if (contentType) {
    res.setHeader('content-type', contentType)
  }

  const stream = fs.createReadStream(filePath)
  stream.once('error', error => {
    logger.error('Failed to serve file:', filePath, error)
    if (res.headersSent) {
      res.destroy(error)
    } else {
      res.statusCode = 404
      res.end()
    }
  })

  return stream.pipe(res)
}

const serveStatic = (root, prefix) => {
  return (req, res, next) => {
    if (!req.asPath.startsWith(prefix)) {
      return next()
    }

    const filePath = resolveWithin(root, req.asPath)
    if (!filePath || !isFile(filePath)) {
      logger.warn('Static file not found:', req.asPath)
      return next()
    }

    return sendFile(res, filePath)
  }
}

const use = route => {
  routes.unshift((req, res, next) => () => route(req, res, next))
}

// /page/:number
use((req, res, next) => {
  if (/^\/page\/\d+$/.test(req.asPath)) {
    return sendFile(res, path.join(OUT_DIR, 'index.html'))
  }
  return next()
})

// /assets/path
use(serveStatic(OUT_DIR, '/assets/'))

// /_static/markdown.css
// /_static/highlight.css
use((req, res, next) => {
  try {
    if (req.mkcss && req.asPath === '/_static/markdown.css' && isFile(req.mkcss)) {
      return sendFile(res, req.mkcss)
    }
    if (req.hicss && req.asPath === '/_static/highlight.css' && isFile(req.hicss)) {
      return sendFile(res, req.hicss)
    }
  } catch (error) {
    logger.error('Failed to load custom CSS:', req.asPath, error)
  }
  return next()
})

// /_static/path
use(serveStatic(__dirname, '/_static/'))

// Local Markdown images deliberately resolve outside the plugin directory.
use(async (req, res, next) => {
  logger.info('image route: ', req.asPath)
  const prefix = '/_local_image_'
  if (!req.asPath.startsWith(prefix)) {
    return next()
  }

  const plugin = req.plugin
  const buffers = await plugin.nvim.buffers
  const buffer = buffers.find(item => item.id === Number(req.bufnr))
  if (!buffer) {
    return next()
  }

  let fileDir = req.custImgPath
  if (fileDir === '') {
    fileDir = await plugin.nvim.call('expand', `#${req.bufnr}:p:h`)
  }

  if (process.env.MINGW_HOME && !fileDir.includes(':')) {
    const { execSync } = require('node:child_process')
    fileDir = execSync(`cygpath.exe -w -a ${fileDir}`).toString('utf8').trim()
  }

  let imagePath
  try {
    imagePath = decodeURIComponent(decodeURIComponent(req.asPath.slice(prefix.length)))
  } catch (error) {
    logger.error('Failed to decode image path:', req.asPath, error)
    return next()
  }

  imagePath = imagePath.replace(/\\ /g, ' ')
  if (imagePath[0] !== '/' && imagePath[0] !== '\\') {
    imagePath = path.join(fileDir, imagePath)
  } else if (!fs.existsSync(imagePath)) {
    let parentDir = fileDir
    while (parentDir !== '/' && parentDir !== '\\') {
      parentDir = path.normalize(path.join(parentDir, '..'))
      const candidatePath = path.join(parentDir, imagePath)
      if (fs.existsSync(candidatePath)) {
        imagePath = candidatePath
        break
      }
    }
  }

  if (isFile(imagePath)) {
    return sendFile(res, imagePath)
  }

  logger.error('Image not found:', imagePath)
  return next()
})

// 404
use((req, res) => {
  res.statusCode = 404
  return sendFile(res, path.join(OUT_DIR, '404.html'))
})

module.exports = (req, res, next) => {
  return routes.reduce((handler, route) => route(req, res, handler), next)()
}
