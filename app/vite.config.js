module.exports = ({ mode }) => {
  if (mode === 'server') {
    return {
      publicDir: false,
      ssr: {
        noExternal: true
      },
      build: {
        outDir: 'runtime',
        ssr: 'server.js',
        rolldownOptions: {
          output: {
            entryFileNames: 'server.cjs',
            format: 'cjs'
          }
        }
      }
    }
  }

  return {
    build: {
      assetsDir: 'assets',
      chunkSizeWarningLimit: 2500,
      outDir: 'out'
    }
  }
}
