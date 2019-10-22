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

async function build (req, params) {
  const request = Object.create(Request)
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
  request.body = await buildBody(req)
  return request
}

function buildBody (req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      resolve(parseBody(req, body))
    })
    req.on('error', err => {
      reject(err)
    })
  })
}

function parseBody (req, body) {
  if (req.headers['content-type'] === 'application/json') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      return e
    }
  }
  return body
}

module.exports = {
  init: function () {
    return Request
  },
  build
}
