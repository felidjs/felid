const assert = require('assert')
const {
  PRE_REQUEST,
  POST_RESPONSE
} = require('./symbol')

const availableHooks = {
  [getSymbolValue(PRE_REQUEST)]: PRE_REQUEST,
  [getSymbolValue(POST_RESPONSE)]: POST_RESPONSE
}

const hookMap = {}

function Hooks () {}

Hooks.prototype.add = function (hookName, handler) {
  assert.ok(Object.keys(availableHooks).includes(hookName), `Invalid hook: ${hookName}`)
  assert.equal(typeof handler, 'function', `Handler for '${hookName}' hook should be a function`)
  hookMap[availableHooks[hookName]] = handler
}

Hooks.prototype.run = function (hook, ...args) {
  if (!Object.getOwnPropertySymbols(hookMap).includes(hook)) return
  const handler = hookMap[hook]
  if (handler) {
    handler(...args)
  }
}

module.exports = Hooks

function getSymbolValue (symbol) {
  return symbol.description.split('.')[1]
}
