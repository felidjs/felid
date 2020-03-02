const assert = require('assert')

const {
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
} = require('./constants')

const availableHooks = [
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
]

class Hooks {
  constructor () {
    this.hookMap = new Map()
  }

  add (hookName, ...handlers) {
    assert.ok(availableHooks.includes(hookName), `Invalid hook: ${hookName}`)
    addHandlers(this.hookMap, hookName, handlers)
  }

  get (hookName) {
    return this.hookMap.get(hookName) || []
  }

  run (hookName, ...args) {
    const fns = this.get(hookName)
    return runHooks(fns, ...args)
  }
}

module.exports = Hooks

function addHandlers (map, name, handlers) {
  if (!map.has(name)) {
    map.set(name, [])
  }
  const arr = map.get(name)
  handlers.forEach(handler => {
    assert.strictEqual(typeof handler, 'function', `Handler for '${name}' hook should be a function`)
    arr.push(handler)
  })
}

function runHooks (hooks, ...args) {
  let index = 0
  let keepRunning = true
  async function next (keep = true) {
    if (keep === false) {
      keepRunning = keep
    }
    if (keepRunning && typeof hooks[index] === 'function') {
      const res = await hooks[index++](...args, next)
      if (res === false) {
        return Promise.resolve(res)
      }
      return next()
    }
    return Promise.resolve()
  }
  return next()
}
