const injectar = require('injectar')
const Felid = require('../src')

// code()
test('response.code() should set correct status code', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    res.code(600).send()
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(600)
    })
})

test('response.code() should return the correct status code', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    res.code(600)
    expect(res.code()).toBe(600)
    res.send()
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

// header()
test('response.header() should set the given header correctly', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    res.header('foo', 'bar').send()
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers.foo).toBe('bar')
    })
})

test('response.header() should set the given headers correctly', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    res.header({
      foo: 'bar',
      bar: 'foo'
    }).send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers.foo).toBe('bar')
      expect(res.headers.bar).toBe('foo')
    })
})

test('response.header() should return the given header value', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    res.header('foo', 'bar')
    expect(res.header('foo')).toBe('bar')
    res.send()
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

// redirect()
test('response.redirect() should redirect correctly', () => {
  const instance = new Felid()
  
  instance.get('/test', (req, res) => {
    res.redirect('/dest')
  })
  instance.get('/code-600', (req, res) => {
    res.redirect(600, '/dest')
  })
  instance.get('/dest', (req, res) => {
    res.send('dest')
  })

  const inject = injectar(instance.lookup())
  inject
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toBe('/dest')
    })
  
  inject
    .get('/code-600')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(600)
      expect(res.headers.location).toBe('/dest')
    })
})

// send()
test('response.send() should set content-type correctly', () => {
  const instance = new Felid()
  const stringMsg = 'string'
  const bufferMsg = 'a buffer'
  const jsonMsg = { json: 'data' }
  
  instance.get('/type-string', (req, res) => {
    res.send(stringMsg)
  })
  instance.get('/type-buffer', (req, res) => {
    res.send(Buffer.from(bufferMsg))
  })
  instance.get('/type-json', (req, res) => {
    res.send(jsonMsg)
  })

  const inject = injectar(instance.lookup())
  inject
    .get('/type-string')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
      expect(res.payload).toBe(stringMsg)
    })

  inject
    .get('/type-buffer')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers['content-type']).toBe('application/octet-stream')
      expect(res.payload).toBe(bufferMsg)
    })

  inject
    .get('/type-json')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
      expect(res.payload).toBe(JSON.stringify(jsonMsg))
    })
})

test('response.send() should throw if called multiple times', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    res.send('a')
    expect(() => {
      res.send('b')
    }).toThrow()
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('a')
    })
})
