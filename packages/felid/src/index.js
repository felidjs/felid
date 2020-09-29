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

const Hook = require('./hook')
const Parser = require('./parser')
const Request = require('./request')
const Response = require('./response')
const Router = require('./router')

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
  exit (exitCode, callback) {
    this.close(callback)
    process.exit(exitCode || 0)
  }

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
    Router.buildRoute(this, { method, url, handler, store })
  }

  all (url, handler, store) {
    Router.buildRoute(this, { method: supportedHttpMethods, url, handler, store })
  }

  // bosy parser
  addParser (type, parser) {
    this[kParsers].add(type, parser)
  }

  _init (options) {
    this._initServer(options, this.lookup())
    this._initFelid(options)
    this._initDecorators(this[kRequest], 'decorateRequest', 'hasRequestDecorator')
    this._initDecorators(this[kResponse], 'decorateResponse', 'hasResponseDecorator')
  }

  _initFelid (options = {}) {
    this.logger = options.logger
      ? options.logger
      : require('abstract-logging')
    this.routePrefix = normalizeRoutePrefix(options.routePrefix)

    this[kErrorHandler] = typeof options.errorHandler === 'function'
      ? options.errorHandler
      : handleError
    this[kHooks] = new Hook()
    this[kParsers] = new Parser()
    this[kRequest] = Request.init()
    this[kRequest].parsers = this[kParsers]
    this[kResponse] = Response.init()
    this[kRouter] = Router.init(options.routeOptions)
    supportedHttpMethods.forEach(method => {
      Object.defineProperty(this, method, {
        value (url, handler, store) {
          Router.buildRoute(this, { method, url, handler, store })
        },
        writable: false,
        configurable: false,
        enumerable: false
      })
    })
  }
}

module.exports = Felid

function handleError (err, req, res) {
  if (res instanceof http.ServerResponse) {
    res.statusCode = 500
    res.end(err.message || res.statusCode.toString())
    return
  }
  res.code(500).send(err.message || res.code())
}

function normalizeRoutePrefix (prefix) {
  if (!prefix) return ''
  assert.strictEqual(typeof prefix, 'string', 'options.routePrefix should be a string')
  return prefix.startsWith('/') || prefix.startsWith('*')
    ? prefix
    : '/' + prefix
}
