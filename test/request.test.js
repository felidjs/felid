const injectar = require('injectar')
const Felid = require('../src')

// body
test('request.body should parse the request body if content-type is text/plain', () => {
  const instance = new Felid()
  const msg = 'a plain text'
  instance.post('/test', (req, res) => {
    expect(req.body).toStrictEqual(msg)
    res.send()
  })

  injectar(instance.lookup())
    .post('/test')
    .headers({ 'content-type': 'text/plain' })
    .body(msg)
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

test('request.body should parse the request body if content-type is application/json', () => {
  const instance = new Felid()
  const msg = { json: 'data' }
  instance.post('/test', (req, res) => {
    expect(req.body).toStrictEqual(msg)
    res.send()
  })

  injectar(instance.lookup())
    .post('/test')
    .headers({ 'content-type': 'application/json' })
    .body(msg)
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

// headers
test('request.headers should return the request headers', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    expect(typeof req.headers).toBe('object')
    expect(req.headers.foo).toBe('bar')
    res.send()
  })

  injectar(instance.lookup())
    .get('/test')
    .headers({ foo: 'bar' })
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

// method
test('request.method should indicate the request method', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    expect(req.method).toBe('get')
    res.send()
  })
  instance.post('/test', (req, res) => {
    expect(req.method).toBe('post')
    res.send()
  })

  const inject = injectar(instance.lookup())
  inject.get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })
  inject.post('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

// url
test('request.url should indicate the request url', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    expect(req.url).toBe('/test')
    res.send()
  })
  instance.get('/test1', (req, res) => {
    expect(req.url).toBe('/test1')
    res.send()
  })

  const inject = injectar(instance.lookup())
  inject.get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })
  inject.get('/test1')
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

// header()
test('request.header() should return the given header value', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    expect(req.header('foo')).toBe('bar')
    res.send()
  })

  injectar(instance.lookup())
    .get('/test')
    .headers({ foo: 'bar' })
    .end((err, res) => {
      expect(err).toBe(null)
    })
})
