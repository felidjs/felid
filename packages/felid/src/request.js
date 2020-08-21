const querystring = require('querystring')
const delegate = require('delegates')

function init () {
  const Request = {
    header (key) {
      return this.req.headers[key]
    }
  }

  delegate(Request, 'req')
    .getter('headers')
    .getter('method')
    .getter('url')

  return Object.create(Request)
}

async function build (proto, req, params) {
  const noBodyMethods = [
    'GET',
    'OPTIONS',
    'HEAD',
    'TRACE'
  ]

  function buildBody (request) {
    const req = request.req
    const contentType = req.headers['content-type'] || ''
    const parser = request.parsers.get(contentType)
    return parser(req)
  }

  const request = Object.create(proto)
  request.req = req
  const queryPrefix = req.url.indexOf('?')
  if (queryPrefix >= 0) {
    request.query = querystring.parse(req.url.slice(queryPrefix + 1))
  }
  if (params) {
    request.params = params
  }
  if (noBodyMethods.indexOf(req.method) >= 0) {
    return request
  }
  request.body = await buildBody(request)
  return request
}

module.exports = {
  init,
  build
}
