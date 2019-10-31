const querystring = require('querystring')

const noBodyMethods = [
  'get',
  'options',
  'head',
  'trace'
]

const Request = {
  header (key) {
    return this.req.headers[key]
  },

  get headers () {
    return this.req.headers
  },

  get method () {
    return this.req.method
  },

  get url () {
    return this.req.url
  }
}

async function build (proto, req, params) {
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

function buildBody (request) {
  const req = request.req
  const contentType = req.headers['content-type'] || ''
  const parser = request.parsers.get(contentType)
  return parser(req)
}

module.exports = {
  init: function () {
    return Object.create(Request)
  },
  build
}
