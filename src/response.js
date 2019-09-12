function buildResponse (res) {
  res.code = (code) => {
    res.statusCode = code
    return res
  }
  res.redirect = (code, url) => {
    if (typeof code === 'string') {
      url = code
      code = 302
    }
    res.setHeader('location', url)
    res.code(code).send()
  }
  res.send = (payload) => {
    if (typeof payload === 'string') {
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      res.end(payload)
      return
    }
    if (Buffer.isBuffer(payload)) {
      res.setHeader('content-type', 'application/octet-stream')
      res.end(payload)
      return
    }
    try {
      const jsonPayload = JSON.stringify(payload)
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(jsonPayload)
    } catch (e) {
      res.end(payload)
    }
  }
  return res
}

module.exports.build = buildResponse
