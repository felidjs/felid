const assert = require('assert')

const Response = {
  code (code) {
    if (code === undefined) {
      return this.res.statusCode
    }
    this.res.statusCode = code
    return this
  },

  get finished () {
    return this.res.finished
  },

  header (key, value) {
    if (key === undefined && value === undefined) {
      return this.res.getHeaders()
    }
    if (typeof key === 'string' && value === undefined) {
      return this.res.getHeader(key)
    }
    if (key && typeof key === 'object') {
      for (const k in key) {
        this.res.setHeader(k, key[k])
      }
      return this
    }
    this.res.setHeader(key, value)
    return this
  },

  get headers () {
    return this.res.headers
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
    if (this.finished) return
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
  }
}

function build (proto, request, res) {
  const response = Object.create(proto)
  response.request = request
  response.res = res
  return response
}

function onSend (response, payload) {
  assert.strictEqual(response.finished, false, 'The response has already been sent')
  response.res.end(payload)
}

module.exports = {
  init: function () {
    return Object.create(Response)
  },
  build
}
