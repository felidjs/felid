const assert = require('assert')
const {
  HOOK_PRE_REQUEST,
  HOOK_POST_RESPONSE
} = require('./constance')

const availableHooks = [HOOK_PRE_REQUEST, HOOK_POST_RESPONSE]

const hookMap = {}

function Hooks () {}

Hooks.prototype.add = function (hookName, handler) {
  assert.ok(availableHooks.includes(hookName), `Invalid hook: ${hookName}`)
  assert.equal(typeof handler, 'function', `Handler for '${hookName}' hook should be a function`)
  hookMap[hookName] = handler
}

Hooks.prototype.run = function (hook, ...args) {
  if (!hook in hookMap) return
  const handler = hookMap[hook]
  if (handler) {
    handler(...args)
  }
}

module.exports = Hooks
