const router = require('./router')
const server = require('./server')
const buildRequest = require('./request').build
const buildResponse = require('./response').build

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
    res = buildResponse(res)

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

// TODO: split handler, req, res
// TODO: parse body
// TODO: route middlewares
// TODO: hooks: handle error...
