const assert = require('assert')
const delegate = require('delegates')

const Response = {
  code (code) {
    if (code === undefined) {
      return this.res.statusCode
    }
    this.res.statusCode = code
    return this
  },

  getHeader (key) {
    return this.res.getHeader(key)
  },

  getHeaders () {
    return this.res.getHeaders()
  },

  header (key, value) {
    if (key === undefined && value === undefined) {
      return this.getHeaders()
    }
    if (typeof key === 'string' && value === undefined) {
      return this.getHeader(key)
    }
    if (key && typeof key === 'object') {
      return this.setHeaders(key)
    }
    return this.setHeader(key, value)
  },

  redirect (code, url) {
    if (typeof code === 'string') {
      url = code
      code = 302
    }
    this.res.setHeader('location', url)
    this.res.statusCode = code
    this.send()
  },

  send (payload) {
    assert.strictEqual(this.finished, false, 'The response has already been sent')
    if (typeof payload === 'string') {
      if (!this.res.hasHeader('content-type')) {
        this.res.setHeader('content-type', 'text/plain; charset=utf-8')
      }
      onSend(this, payload)
      return
    }
    if (Buffer.isBuffer(payload)) {
      if (!this.res.hasHeader('content-type')) {
        this.res.setHeader('content-type', 'application/octet-stream')
      }
      onSend(this, payload)
      return
    }
    try {
      const jsonPayload = JSON.stringify(payload)
      if (!this.res.hasHeader('content-type')) {
        this.res.setHeader('content-type', 'application/json; charset=utf-8')
      }
      onSend(this, jsonPayload)
    } catch (e) {
      onSend(this, payload)
    }
  },

  setHeader (key, value) {
    assert.notStrictEqual(key, undefined, 'The key for a header should not be undefined')

    this.res.setHeader(key, value)
    return this
  },

  setHeaders (headers) {
    assert.ok(headers, 'A valid object of headers should be provided')
    assert.strictEqual(typeof headers, 'object', 'A valid object of headers should be provided')
    for (const key in headers) {
      this.setHeader(key, headers[key])
    }
    return this
  }
}

delegate(Response, 'res')
  .getter('finished')

function build (proto, request, res) {
  const response = Object.create(proto)
  response.request = request
  response.res = res
  return response
}

function onSend (response, payload) {
  response.res.end(payload)
}

module.exports = {
  init: function () {
    return Object.create(Response)
  },
  build
}
