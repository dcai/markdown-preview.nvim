const { version } = require('../package.json')

process.chdir(__dirname)
process.env.MKDP_APP_DIR = __dirname

if (process.argv[2] === '--version') {
  console.log(version)
} else {
  require('./runtime/server.cjs').run()
}
