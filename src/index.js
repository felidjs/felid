const router = require('./router')
const server = require('./server')
const Hook = require('./hook')
const buildRequest = require('./request').build
const buildResponse = require('./response').build

const {
  PRE_REQUEST
} = require('./symbol')

class Felid {
  constructor (options = {}) {
    this.option = {
      routeOptions: {},
      ...options
    }
  
    this.hooks = new Hook()
    this.middlewares = []
    this.routeMiddlewares = {}
    this.router = router({
      defaultRoute: (req, res) => {
        res.statusCode = 404
        res.end()
      },
      ...this.option.routeOptions
    })
  }

  // hook
  hook (hookName, handler) {
    this.hooks.add(hookName, handler)
  }

  // middleware
  use (url, ...middle) {
    if (typeof url === 'function') {
      middle = url
      this.middlewares.push(middle)
    } else if (typeof url === 'string') {
      if (!this.routeMiddlewares[url]) {
        this.routeMiddlewares[url] = []
      }
      this.routeMiddlewares[url].push(...middle)
    } else if (Array.isArray(url)) {
      url.forEach(path => {
        this.use(path, ...middle)
      })
    }
  }

  // listen
  listen (...args) {
    this.server = server((req, res) => {
      this.router.lookup(req, res)
    }, ...args)
    this.address = this.server.address()
  }

  // route
  on (method, url, handler) {
    return this.router.on(method.toUpperCase(), url, buildHanlder.call(this, url, handler))
  }

  all (url, handler, store) {
    return this.router.all(url, buildHanlder.call(this, url, handler), store)
  }
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

httpMethods.forEach(method => {
  Felid.prototype[method] = function (url, handler) {
    return this.router[method](url, buildHanlder.call(this, url, handler))
  }
})

module.exports = Felid

function buildHanlder (url, handler) {
  const middlewares = this.routeMiddlewares[url]
    ? this.middlewares.concat(this.routeMiddlewares[url])
    : this.middlewares
  return async (req, res, params) => {
    this.hooks.run(PRE_REQUEST, req, res)

    req = await buildRequest(req, params)
    res = buildResponse(this, req, res)

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
