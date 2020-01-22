const assert = require('assert')
const http = require('http')

const Core = require('@felid/core')
const {
  kErrorHandler,
  kHooks,
  kParsers,
  kRequest,
  kResponse,
  kRouter
} = require('@felid/symbols')

const router = require('./router')
const Hook = require('./hook')
const Parser = require('./parser')
const Request = require('./request')
const Response = require('./response')

const {
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
} = require('./constants')

const supportedHttpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put'
]

class Felid extends Core {
  lookup () {
    return (req, res) => this[kRouter].lookup(req, res)
  }

  // hook
  hook (hookName, ...handlers) {
    this[kHooks].add(hookName, ...handlers)
  }

  preRequest (...handlers) {
    this[kHooks].add(HOOK_PRE_REQUEST, ...handlers)
  }

  use (...handlers) {
    this[kHooks].add(HOOK_MIDDLE, ...handlers)
  }

  postResponse (...handlers) {
    this[kHooks].add(HOOK_POST_RESPONSE, ...handlers)
  }

  // route
  on (method, url, handler, store) {
    this[kRouter].on(method.toUpperCase(), url, buildHandler(this, handler), store)
  }

  all (url, handler, store) {
    this[kRouter].on(supportedHttpMethods.map(m => m.toUpperCase()), url, buildHandler(this, handler), store)
  }

  // bosy parser
  addParser (type, parser) {
    this[kParsers].add(type, parser)
  }

  // error handle
  onError (fn) {
    assert.strictEqual(typeof fn, 'function', 'Error handler must be a function')
    this[kErrorHandler] = fn.bind(this)
  }

  _init (options = {}) {
    this._initServer(options, this.lookup())
    this._initFelid(options)
    this._initDecorators(this[kRequest], 'decorateRequest', 'hasRequestDecorator')
    this._initDecorators(this[kResponse], 'decorateResponse', 'hasResponseDecorator')
  }

  _initFelid (options) {
    this.logger = options.logger
      ? options.logger
      : require('abstract-logging')

    this[kErrorHandler] = handleError.bind(this)
    this[kHooks] = new Hook()
    this[kParsers] = new Parser()
    this[kRequest] = Request.init()
    this[kResponse] = Response.init()
    this[kRouter] = router(options.routeOptions)
    supportedHttpMethods.forEach(method => {
      Object.defineProperty(this, method, {
        value (url, handler, store) {
          return this[kRouter][method](url, buildHandler(this, handler), store)
        },
        writable: false,
        configurable: false,
        enumerable: false
      })
    })

    this[kRequest].parsers = this[kParsers]
  }
}

module.exports = Felid

function buildHandler (ctx, handler) {
  return async function (req, res, params) {
    let request, response
    async function buildObjs (req, res, params) {
      request = await Request.build(ctx[kRequest], req, params)
      response = Response.build(ctx[kResponse], request, res)
    }
    async function handle () {
      let next
      next = await ctx[kHooks].run(HOOK_PRE_REQUEST, req, res)
      if (next === false) return
      await buildObjs(req, res, params)
      next = await ctx[kHooks].run(HOOK_MIDDLE, request, response)
      if (next === false) return
      next = await handler(request, response)
      if (next === false) return
      await ctx[kHooks].run(HOOK_POST_RESPONSE, request, response)
    }
    try {
      await handle()
    } catch (e) {
      ctx[kErrorHandler](e, request || req, response || res)
    }
  }
}

function handleError (err, req, res) {
  if (res instanceof http.ServerResponse) {
    res.statusCode = 500
    res.end(err.message || res.statusCode.toString())
    return
  }
  res.code(500).send(err.message || res.code())
}
