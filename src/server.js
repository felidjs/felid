const http = require('http')

function server (handler) {
  const server = http.createServer(handler)
  return server
}

module.exports = server
