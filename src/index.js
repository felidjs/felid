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

// route
felid.prototype.on = function (method, url, handler) {
  return this.router.on(method, url, handler)
}

felid.prototype.all = function (url, handler, store) {
  return this.router.all(url, handler, store)
}

felid.prototype.delete = function (url, handler) {
  return this.router.delete(url, handler)
}

felid.prototype.get = function (url, handler) {
  return this.router.get(url, buildHanlder.call(this, handler))
}

felid.prototype.post = function (url, handler) {
  return this.router.post(url, handler)
}

felid.prototype.put = function (url, handler) {
  return this.router.put(url, handler)
}

module.exports = felid

function buildHanlder (handler) {
  const middlewares = this.middlewares
  return function (req, res) {
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
