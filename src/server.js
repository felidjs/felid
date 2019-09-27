const http = require('http')

function server (handler, ...args) {
  const server = http.createServer(handler)
  server.listen(...args)
  return server
}

module.exports = server
