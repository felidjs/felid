const injectar = require('injectar')
const Felid = require('../src')

describe('query', () => {
  test('request.query should parse the query string', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.send(req.query)
    })

    injectar(instance.lookup())
      .get('/test?foo=bar&query=string')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.json()).toStrictEqual({ foo: 'bar', query: 'string' })
        done()
      })
  })
})

describe('params', () => {
  test('request.params should store url params', (done) => {
    const instance = new Felid()
    instance.get('/test/:id', (req, res) => {
      res.send(req.params.id)
    })

    injectar(instance.lookup())
      .get('/test/1')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('1')
        done()
      })
  })
})

describe('body', () => {
  test('request.body should parse the request body if content-type is text/plain', (done) => {
    const instance = new Felid()
    const msg = 'a plain text'
    instance.post('/test', (req, res) => {
      expect(req.body).toStrictEqual(msg)
      res.send('test')
    })

    injectar(instance.lookup())
      .post('/test')
      .headers({ 'content-type': 'text/plain' })
      .body(msg)
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })

  test('request.body should parse the request body if content-type is application/json', (done) => {
    const instance = new Felid()
    const msg = { json: 'data' }
    instance.post('/test', (req, res) => {
      expect(req.body).toStrictEqual(msg)
      res.send('test')
    })

    injectar(instance.lookup())
      .post('/test')
      .headers({ 'content-type': 'application/json' })
      .body(msg)
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})

describe('headers', () => {
  test('request.headers should return the request headers', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      expect(typeof req.headers).toBe('object')
      expect(req.headers.foo).toBe('bar')
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .headers({ foo: 'bar' })
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})

describe('method', () => {
  test('request.method should indicate the request method', async () => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.send(req.method)
    })
    instance.post('/test', (req, res) => {
      res.send(req.method)
    })

    const inject = injectar(instance.lookup())
    let res
    res = await inject.get('/test').end()
    expect(res.payload).toBe('GET')
    res = await inject.post('/test').end()
    expect(res.payload).toBe('POST')
  })
})

describe('url', () => {
  test('request.url should indicate the request url', async () => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.send(req.url)
    })
    instance.get('/test1', (req, res) => {
      res.send(req.url)
    })

    const inject = injectar(instance.lookup())
    let res
    res = await inject.get('/test').end()
    expect(res.payload).toBe('/test')
    res = await inject.get('/test1').end()
    expect(res.payload).toBe('/test1')
  })
})

describe('header()', () => {
  test('request.header() should return the given header value', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      expect(req.header('foo')).toBe('bar')
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .headers({ foo: 'bar' })
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})
