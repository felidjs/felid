const {
  POST_RESPONSE
} = require('./symbol')

const Response = {
  code (code) {
    if (code === undefined) {
      return this.res.statusCode
    }
    this.res.statusCode = code
    return this
  },

  header (key, value) {
    if (value === undefined) {
      return this.res.getHeader(key)
    }
    this.res.setHeader(key, value)
    return this
  },

  set headers (value) {
    this.res.headers = value
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
    this.code(code).send()
  },

  send (payload) {
    if (typeof payload === 'string') {
      if (!this.res.hasHeader('content-type')) {
        this.header('content-type', 'text/plain; charset=utf-8')
      }
      onSend(this, payload)
      return
    }
    if (Buffer.isBuffer(payload)) {
      if (!this.res.hasHeader('content-type')) {
        this.header('content-type', 'application/octet-stream')
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

function build (request, res) {
  const response = Object.create(Response)
  response.request = request
  response.res = res
  return response
}

function onSend (response, payload) {
  response.res.end(payload)
  response.context.hooks.run(POST_RESPONSE, response.request, response)
}

module.exports = {
  init: function (ctx) {
    Response.context = ctx
    return Response
  },
  build: function (request, res) {
    return build(request, res)
  }
}
