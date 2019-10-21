const assert = require('assert')
const {
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
} = require('./constance')

const availableHooks = [
  HOOK_PRE_REQUEST,
  HOOK_MIDDLE,
  HOOK_POST_RESPONSE
]

const hookMap = new Map()
const routeHookMap = new Map()

function Hooks () {}

Hooks.prototype.add = function (hookName, url, ...handlers) {
  if (typeof url === 'function') {
    handlers = [url, ...handlers]
    url = undefined
  }
  assert.ok(availableHooks.includes(hookName), `Invalid hook: ${hookName}`)
  if (url === undefined) {
    addHandlers(hookMap, hookName, handlers)
  } else if (typeof url === 'string') {
    if (!routeHookMap.has(url)) {
      routeHookMap.set(url, new Map())
    }
    addHandlers(routeHookMap.get(url), hookName, handlers)
  } else {
    assert.ok(Array.isArray(url), 'Url attached to the hook must be a string or an array of string')
    url.forEach(path => {
      assert.equal(typeof path, 'string', 'Url in array attached to the hook must be a string')
      this.add(hookName, path, ...handlers)
    })
  }
}

Hooks.prototype.run = function (hookName, url, ...args) {
  if (!hookMap.has(hookName)) return onHookEnd(hookName)
  const fns = concatHooks(hookName, url)
  let index = 0
  async function next () {
    if (typeof fns[index] === 'function') {
      await fns[index++](...args, () => {})
      return next()
    }
    return onHookEnd(hookName)
  }
  return next()
}

module.exports = Hooks

function addHandlers (map, name, handlers) {
  if (!map.has(name)) {
    map.set(name, [])
  }
  const arr = map.get(name)
  handlers.forEach(handler => {
    assert.equal(typeof handler, 'function', `Handler for '${name}' hook should be a function`)
    arr.push(handler)
  })
}

function concatHooks (name, url) {
  if (!url || !routeHookMap.has(url)) {
    return hookMap.get(name)
  }
  const routeHook = routeHookMap.get(url)
  if (!routeHook.has(name)) {
    return hookMap.get(name)
  }
  return hookMap.get(name).concat(routeHook.get(name))
}

function onHookEnd (name) {
  return Promise.resolve()
}
