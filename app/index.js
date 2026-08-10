const { version } = require('../package.json')

process.chdir(__dirname)

if (process.argv[2] === '--version') {
  console.log(version)
} else {
  require('./server').run()
}
