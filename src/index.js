const router = require('./router')
const server = require('./server')
const Hook = require('./hook')
const Request = require('./request')
const Response = require('./response')

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
    this.request = Request.init()
    this.response = Response.init(this)
    this.router = router({
      defaultRoute: (req, res) => {
        res.statusCode = 404
        res.end()
      },
      ...this.option.routeOptions
    })
  }

  // decorate
  decorate (key, value) {
    buildDecorator(this, key, value)
  }

  decorateRequest (key, value) {
    buildDecorator(this.request, key, value)
  }

  decorateResponse (key, value) {
    buildDecorator(this.response, key, value)
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
  on (method, url, handler, store) {
    return this.router.on(method.toUpperCase(), url, buildHanlder.call(this, url, handler), store)
  }

  all (url, handler, store) {
    return this.router.all(url, buildHanlder.call(this, url, handler), store)
  }

  // plugin
  plugin (fn, option) {
    if (typeof fn !== 'function') return
    fn(this, option)
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

    const request = await Request.build(req, params)
    const response = Response.build(request, res)

    let index = 0
    function next () {
      if (middlewares[index]) {
        middlewares[index++](request, response, next)
      } else {
        handler(request, response)
      }
    }
    if (middlewares.length) {
      next()
    } else {
      handler(request, response)
    }
  }
}

function buildDecorator (instance, key, value) {
  if (key === undefined || value === undefined) return
  if (instance.hasOwnProperty(key)) return
  instance[key] = value
}
