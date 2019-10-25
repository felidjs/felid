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
} = require('./constants')

const {
  kOption,
  kErrorHandler,
  kHooks,
  kRequest,
  kResponse,
  kRouter,
  kServer
} = require('./symbols')

class Felid {
  constructor (options = {}) {
    this[kOption] = {
      routeOptions: {},
      ...options
    }

    this.address = null
    this[kServer] = null

    this[kErrorHandler] = handleError.bind(this)
    this[kHooks] = new Hook()
    this[kRequest] = Request.init()
    this[kResponse] = Response.init(this)
    this[kRouter] = router({
      defaultRoute: (req, res) => {
        res.statusCode = 404
        res.end()
      },
      ...this[kOption].routeOptions
    })
  }

  // decorate
  decorate (key, value) {
    buildDecorator(this, key, value)
  }

  decorateRequest (key, value) {
    buildDecorator(this[kRequest], key, value)
  }

  decorateResponse (key, value) {
    buildDecorator(this[kResponse], key, value)
  }

  hasDecorator (key) {
    return checkDecoratorExists(this, key)
  }

  hasRequestDecorator (key) {
    return checkDecoratorExists(this[kRequest], key)
  }

  hasResponseDecorator (key) {
    return checkDecoratorExists(this[kResponse], key)
  }

  // hook
  hook (hookName, url, ...handlers) {
    this[kHooks].add(hookName, url, ...handlers)
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
    this[kServer] = server(this.lookup(), ...args)
    this.address = this[kServer].address()
  }

  lookup () {
    return (req, res) => this[kRouter].lookup(req, res)
  }

  // route
  on (method, url, handler, store) {
    return this[kRouter].on(method.toUpperCase(), url, buildHanlder(this, url, handler), store)
  }

  all (url, handler, store) {
    return this[kRouter].all(url, buildHanlder(this, url, handler), store)
  }

  // plugin
  plugin (fn, option) {
    assert.strictEqual(typeof fn, 'function', 'Handler for plugin must be a function')
    fn(this, option)
  }

  // error handle
  onError (fn) {
    assert.strictEqual(typeof fn, 'function', 'Error handler must be a function')
    this[kErrorHandler] = fn.bind(this)
  }
}

const supportedHttpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put'
]

supportedHttpMethods.forEach(method => {
  Felid.prototype[method] = function (url, handler, store) {
    return this[kRouter][method](url, buildHanlder(this, url, handler), store)
  }
})

module.exports = Felid

function buildHanlder (ctx, url, handler) {
  return function (req, res, params) {
    let request, response
    async function buildObjs (req, res, params) {
      request = await Request.build(ctx[kRequest], req, params)
      response = Response.build(ctx[kResponse], request, res)
      return Promise.resolve()
    }
    ctx[kHooks].run(HOOK_PRE_REQUEST, url, req, res)
      .then(() => buildObjs(req, res, params))
      .then(() => ctx[kHooks].run(HOOK_MIDDLE, url, request, response))
      .then(() => handler(request, response))
      .catch(e => ctx[kErrorHandler](e, request || req, response || res))
  }
}

function buildDecorator (instance, key, value) {
  assert.notStrictEqual(key, undefined, 'The key for a decorator should not be undefined')
  assert.notStrictEqual(value, undefined, 'The value for a decorator should not be undefined')
  assert.ok(!(key in instance), `The property named "${key}" already exists`)
  instance[key] = value
}

function checkDecoratorExists (instance, key) {
  assert.notStrictEqual(key, undefined, 'The decorator name should not be undefined')
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
