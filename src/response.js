function code (code) {
  this.statusCode = code
  return this
}

function redirect (code, url) {
  if (typeof code === 'string') {
    url = code
    code = 302
  }
  this.setHeader('location', url)
  this.code(code).send()
}

function send (payload) {
  if (typeof payload === 'string') {
    if (!this.hasHeader('content-type')) {
      this.setHeader('content-type', 'text/plain; charset=utf-8')
    }
    this.end(payload)
    return
  }
  if (Buffer.isBuffer(payload)) {
    if (!this.hasHeader('content-type')) {
      this.setHeader('content-type', 'application/octet-stream')
    }
    this.end(payload)
    return
  }
  try {
    const jsonPayload = JSON.stringify(payload)
    if (!this.hasHeader('content-type')) {
      this.setHeader('content-type', 'application/json; charset=utf-8')
    }
    this.end(jsonPayload)
  } catch (e) {
    this.end(payload)
  }
}

function buildResponse (res) {
  res.code = code.bind(res)
  res.redirect = redirect.bind(res)
  res.send = send.bind(res)
  return res
}

module.exports.build = buildResponse
