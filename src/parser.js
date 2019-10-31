const assert = require('assert')

class Parser {
  constructor () {
    this.parsers = new Map()
    this.parserKeys = null
  }

  add (type, parser) {
    if (Array.isArray(type)) {
      type.forEach(t => {
        this.add(t, parser)
      })
      return
    }
    assert.strictEqual(typeof type, 'string', `Type of content-type '${type}' should be a string`)
    assert.strictEqual(typeof parser, 'function', `Parser for content-type '${type}' should be a function`)
    this.parsers.set(type, parser)
  }

  get (type) {
    assert.strictEqual(typeof type, 'string', `Type of content-type '${type}' should be a string`)
    if (!this.parserKeys) {
      this.parserKeys = this.parsers.keys()
    }
    this.parserKeys.forEach(key => {
      if (type.indexOf(key) > -1) {
        return this.parsers.get(key)
      }
    })
    return defaultTextParser
  }

  prepare () {
    this.parsers.set('text/plain', defaultTextParser)
    this.parsers.set('application/json', defaultJsonParser)
    this.parserKeys = this.parsers.keys()
  }
}

module.exports = Parser

function defaultTextParser (req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      resolve(body)
    })
    req.on('error', err => {
      reject(err)
    })
  })
}

function defaultJsonParser (req) {
  function parseBody (body) {
    try {
      body = JSON.parse(body)
    } catch (e) {
      return e
    }
    return body
  }
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      resolve(parseBody(body))
    })
    req.on('error', err => {
      reject(err)
    })
  })
}
