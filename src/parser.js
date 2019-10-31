const assert = require('assert')

class Parser {
  constructor () {
    this.parsers = new Map()
    this.parserKeys = []
    this.add('text/plain', defaultTextParser)
    this.add('application/json', defaultJsonParser)
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
    this.parserKeys.push(type)
  }

  get (type) {
    assert.strictEqual(typeof type, 'string', `Type of content-type '${type}' should be a string`)
    if (!type) {
      return defaultTextParser
    }
    for (let i = 0; i < this.parsers.size; ++i) {
      const key = this.parserKeys[i]
      if (type.indexOf(key) > -1) {
        return this.parsers.get(key)
      }
    }
    return defaultTextParser
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

async function defaultJsonParser (req) {
  const raw = await defaultTextParser(req)
  try {
    return JSON.parse(raw)
  } catch (e) {
    return e
  }
}
