const querystring = require('querystring')

const noBodyMethods = [
  'get',
  'options',
  'head',
  'trace'
]

async function buildRequest (req, params) {
  const queryPrefix = req.url.indexOf('?')
  if (queryPrefix >= 0) {
    req.query = querystring.parse(req.url.slice(queryPrefix + 1))
  }
  if (params) {
    req.params = params
  }
  if (noBodyMethods.indexOf(req.method) >= 0) {
    return req
  }
  try {
    req.body = await buildBody(req)
  } catch (e) {
    req.body = null
  }
  return req
}

function buildBody (req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      resolve(body)
    })
    req.on('error', err => {
      reject(err)
    })
  })
}

module.exports.build = buildRequest
