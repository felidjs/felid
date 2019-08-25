const http = require('http')

function server (options, handler) {
  const opt = {
    ...options
  }

  const server = http.createServer(handler)
  return server
}

module.exports = server
