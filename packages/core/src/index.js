const assert = require('assert')
const server = require('@felid/server')
const {
  kServer
} = require('@felid/symbols')
const tiniocc = require('tiniocc')

class FelidCore {
  constructor (options) {
    this._init(options)
    this._container = tiniocc.createContainer()
  }

  get address () {
    return this[kServer] ? this[kServer].address() : null
  }

  get listening () {
    return this[kServer] ? this[kServer].listening : false
  }

  get server () {
    return this[kServer]
  }

  // decorate
  decorate (key, value) {
    buildDecorator(this, key, value)
  }

  hasDecorator (key) {
    return checkDecoratorExists(this, key)
  }

  // listen
  listen (...args) {
    this[kServer].listen(...args)
  }

  // plugin
  plugin (fn, option) {
    assert.strictEqual(typeof fn, 'function', 'Handler for plugin should be a function')
    fn(this, option)
  }

  // others
  close () {
    this[kServer].close()
  }

  _init (options) {
    this._initServer(options, function handler (req, res) {
      res.end('')
    })
  }

  _initServer (options = {}, handler) {
    const opt = {
      http2: options.http2 || null,
      https: options.https || null
    }

    this[kServer] = server(opt, handler)
  }

  _initDecorators (instance, setterName, checkerName) {
    instance._container = tiniocc.createContainer()
    this[setterName] = function (key, value) {
      buildDecorator(instance, key, value)
    }
    this[checkerName] = function (key) {
      return checkDecoratorExists(instance, key)
    }
  }
}

module.exports = FelidCore

function buildDecorator (instance, key, value) {
  assert.notStrictEqual(key, undefined, 'The key for a decorator should not be undefined')
  assert.notStrictEqual(value, undefined, 'The value for a decorator should not be undefined')
  assert.ok(!(key in instance), `The property named "${key}" already exists`)
  instance._container.register(key, value)
  if (typeof value !== 'function') {
    instance[key] = value
  } else {
    Object.defineProperty(instance, key, {
      get: function () {
        return instance._container[key]
      },
      configurable: true,
      enumerable: true
    })
  }
}

function checkDecoratorExists (instance, key) {
  assert.notStrictEqual(key, undefined, 'The decorator name should not be undefined')
  return key in instance
}
