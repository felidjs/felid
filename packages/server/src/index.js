const assert = require('assert')
const http = require('http')
const http2 = require('http2')
const https = require('https')

function server (options, handler) {
  if (options.https) {
    assert.strictEqual(typeof options.https, 'object', 'options.https should be an object')
    return https.createServer(options.https, handler)
  } else if (options.http2) {
    if (options.http2 === true) {
      return http2.createServer(handler)
    } else {
      assert.strictEqual(typeof options.http2, 'object', 'options.http2 should be true or an object')
      return http2.createSecureServer(options.http2, handler)
    }
  } else {
    return http.createServer(handler)
  }
}

module.exports = server
