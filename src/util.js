const fetch = require('node-fetch')

module.exports = {
  async fetch(...args) {
    // fetch() wrapper that tries again if it recives ECONNRESET
    while (true) {
      try {
        console.log('fetch', args)
        return await fetch(...args)
      } catch(e) {
        if (e.code === 'ECONNRESET')
          continue
        else
          throw e
      }
    }
  }
}
