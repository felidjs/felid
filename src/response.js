function buildResponse (res) {
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
