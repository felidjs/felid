const querystring = require('querystring')

const router = require('./router')
const server = require('./server')

function felid (options = {}) {
  this.options = {
    contentType: 'application/json',
    ...options
  }

  this.middlewares = []
  this.router = router({
    defaultRoute: (req, res) => {
      res.statusCode = 404
      res.end()
    }
  })
}

// middleware
felid.prototype.use = function (middle) {
  this.middlewares.push(middle)
}

// listen
felid.prototype.listen = function (port) {
  this.server = server({}, (req, res) => {
    this.router.lookup(req, res)
  })
  this.server.listen(port)
  this.port = port
}

const httpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace'
]

// route
felid.prototype.on = function (method, url, handler) {
  return this.router.on(method, url, buildHanlder.call(this, handler))
}

felid.prototype.all = function (url, handler, store) {
  return this.router.all(url, buildHanlder.call(this, handler), store)
}

httpMethods.forEach(method => {
  felid.prototype[method] = function (url, handler) {
    return this.router[method](url, buildHanlder.call(this, handler))
  }
})

module.exports = felid

function buildHanlder (handler) {
  const middlewares = this.middlewares
  return async (req, res, params) => {
    req = await buildRequest(req, params)
    res.setHeader('content-type', this.options.contentType)

    let index = 0
    function next () {
      if (middlewares[index]) {
        middlewares[index++](req, res, next)
      } else {
        handler(req, res)
      }
    }
    if (middlewares.length) {
      next()
    } else {
      handler(req, res)
    }
  }
}

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

function buildResponse (res) {

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
