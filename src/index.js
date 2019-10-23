const assert = require('assert')
const http = require('http')

const router = require('./router')
const server = require('./server')
const Hook = require('./hook')
const Request = require('./request')
const Response = require('./response')

const {
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
} = require('./constance')

class Felid {
  constructor (options = {}) {
    this.option = {
      routeOptions: {},
      ...options
    }

    this.hooks = new Hook()
    this.request = Request.init()
    this.response = Response.init(this)
    this.router = router({
      defaultRoute: (req, res) => {
        res.statusCode = 404
        res.end()
      },
      ...this.option.routeOptions
    })
    this.errorHandler = handleError.bind(this)
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

  hasDecorator (key) {
    return checkDecoratorExists(this, key)
  }

  hasRequestDecorator (key) {
    return checkDecoratorExists(this.request, key)
  }

  hasResponseDecorator (key) {
    return checkDecoratorExists(this.response, key)
  }

  // hook
  hook (hookName, url, ...handlers) {
    this.hooks.add(hookName, url, ...handlers)
  }

  preRequest (url, ...handlers) {
    this.hook(HOOK_PRE_REQUEST, url, ...handlers)
  }

  use (url, ...handlers) {
    this.hook(HOOK_MIDDLE, url, ...handlers)
  }

  postResponse (url, ...handlers) {
    this.hook(HOOK_POST_RESPONSE, url, ...handlers)
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
    return this.router.on(method.toUpperCase(), url, buildHanlder(this, url, handler), store)
  }

  all (url, handler, store) {
    return this.router.all(url, buildHanlder(this, url, handler), store)
  }

  // plugin
  plugin (fn, option) {
    assert.equal(typeof fn, 'function', 'Handler for plugin must be a function')
    fn(this, option)
  }

  // error handle
  onError (fn) {
    assert.equal(typeof fn, 'function', 'Error handler must be a function')
    this.errorHandler = fn.bind(this)
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
  Felid.prototype[method] = function (url, handler, store) {
    return this.router[method](url, buildHanlder(this, url, handler), store)
  }
})

module.exports = Felid

function buildHanlder (ctx, url, handler) {
  let request, response
  async function buildObjs (req, res, params) {
    request = await Request.build(ctx.request, req, params)
    response = Response.build(ctx.response, request, res, url)
    return Promise.resolve()
  }
  return function (req, res, params) {
    ctx.hooks.run(HOOK_PRE_REQUEST, url, req, res)
      .then(() => buildObjs(req, res, params))
      .then(() => ctx.hooks.run(HOOK_MIDDLE, url, request, response))
      .then(() => handler(request, response))
      .catch(e => {
        ctx.errorHandler(e, request || req, response || res)
      })
  }
}

function buildDecorator (instance, key, value) {
  assert.notEqual(key, undefined, 'The key for a decorator should not be undefined')
  assert.notEqual(value, undefined, `The value for a decorator should not be undefined`)
  assert.ok(!(key in instance), `The property named "${key}" already exists`)
  instance[key] = value
}

function checkDecoratorExists (instance, key) {
  assert.notEqual(key, undefined, 'The decorator name should not be undefined')
  return key in instance
}

function handleError (err, req, res) {
  if (res instanceof http.ServerResponse) {
    res.statusCode = 500
    res.end(err.message || res.statusCode.toString())
    return
  }
  res.code(500).send(err.message || res.code())
}
function checkDecoratorExists (instance, key) {
  assert.notEqual(key, undefined, 'The decorator name should not be undefined')
  return key in instance
}

