const http = require('http')
const https = require('https')

function server (options, handler) {
  let server = null
  if (options.https) {
    server = https.createServer(options.https, handler)
  } else {
    server = http.createServer(handler)
  }
  return server
}

module.exports = server
