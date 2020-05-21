const findMyWay = require('find-my-way')

const {
  kErrorHandler,
  kHooks,
  kRequest,
  kResponse,
  kRouter
} = require('@felid/symbols')

const Request = require('./request')
const Response = require('./response')

const {
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
} = require('./constants')

function init (options) {
  return findMyWay(options)
}

function buildHandler (ctx, handler) {
  return async function (req, res, params, store) {
    let request, response
    async function buildObjs (req, res, params) {
      request = await Request.build(ctx[kRequest], req, params)
      response = Response.build(ctx[kResponse], request, res)
    }
    async function handle () {
      if (await ctx[kHooks].run(HOOK_PRE_REQUEST, req, res) === false) return
      await buildObjs(req, res, params)
      if (await ctx[kHooks].run(HOOK_MIDDLE, request, response) === false) return
      if (await handler(request, response, store) === false) return
      await ctx[kHooks].run(HOOK_POST_RESPONSE, request, response)
    }
    try {
      await handle()
    } catch (e) {
      ctx[kErrorHandler](e, request || req, response || res)
    }
  }
}

function buildMethodParam (method) {
  return method.toUpperCase()
}

function buildRoute (ctx, options) {
  let { method, url, handler, store } = options
  method = Array.isArray(method)
    ? method.map(buildMethodParam)
    : buildMethodParam(method)
  url = ctx.routePrefix + url
  ctx[kRouter].on(method, url, buildHandler(ctx, handler), store)
}

module.exports = {
  init,
  buildHandler,
  buildRoute
}
