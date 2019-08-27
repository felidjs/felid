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
  return (req, res, params) => {
    req = buildRequest(req, params)
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

function buildRequest (req, params) {
  const queryPrefix = req.url.indexOf('?')
  if (queryPrefix >= 0) {
    req.query = querystring.parse(req.url.slice(queryPrefix + 1))
  }
  if (params) {
    req.params = params
  }
  return req
}

function buildResponse (res) {

}
