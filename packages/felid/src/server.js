const assert = require('assert')
const http = require('http')
const http2 = require('http2')
const https = require('https')

function server (options, handler) {
  let server = null
  if (options.https) {
    assert.strictEqual(typeof options.https, 'object', 'options.https must be an object')
    server = https.createServer(options.https, handler)
  } else if (options.http2) {
    if (options.http2 === true) {
      server = http2.createServer(handler)
    } else {
      assert.strictEqual(typeof options.http2, 'object', 'options.http2 must be true or an object')
      server = http2.createSecureServer(options.http2, handler)
    }
  } else {
    server = http.createServer(handler)
  }
  return server
}

module.exports = server
