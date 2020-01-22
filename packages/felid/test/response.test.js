const injectar = require('injectar')
const Felid = require('../src')

describe('finished', () => {
  test('response.finished should indicate whether the response has completed', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      expect(res.finished).toBe(false)
      res.send('test')
      expect(res.finished).toBe(true)
      done()
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
      })
  })
})

describe('code()', () => {
  test('response.code() should set correct status code', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.code(600).send()
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(600)
        done()
      })
  })

  test('response.code() should return the correct status code', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.code(600)
      expect(res.code()).toBe(600)
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})

describe('getHeader()', () => {
  test('response.getHeader() should return the given header value', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.header('foo', 'bar')
      expect(res.getHeader('foo')).toBe('bar')
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})

describe('getHeaders()', () => {
  test('response.getHeaders() should return the response header', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.header('foo', 'bar')
      expect(res.getHeaders().foo).toBe('bar')
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})

describe('header()', () => {
  test('response.header() should set the given header correctly', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.header('foo', 'bar').send()
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.headers.foo).toBe('bar')
        done()
      })
  })

  test('response.header() should set the given headers correctly', (done) => {
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
        done()
      })
  })

  test('response.header() should return the given header value', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.header('foo', 'bar')
      expect(res.header('foo')).toBe('bar')
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })

  test('response.header() should return the response header', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.header('foo', 'bar')
      expect(res.header().foo).toBe('bar')
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
        done()
      })
  })
})

describe('redirect()', () => {
  test('response.redirect() should redirect correctly', async () => {
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
    let res
    res = await inject.get('/test').end()
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('/dest')

    res = await inject.get('/code-600').end()
    expect(res.statusCode).toBe(600)
    expect(res.headers.location).toBe('/dest')
  })
})

describe('removeHeader()', () => {
  test('response.removeHeader() should remove the given header', async () => {
    const instance = new Felid()
    instance.use((req, res) => {
      res.setHeader('foo', 'bar')
    })
    instance.get('/test', (req, res) => {
      res.removeHeader('foo').send()
    })
    instance.get('/test1', (req, res) => {
      res.send()
    })

    const inject = injectar(instance.lookup())
    let res
    res = await inject.get('/test').end()
    expect(res.headers).not.toHaveProperty('foo')

    res = await inject.get('/test1').end()
    expect(res.headers.foo).toBe('bar')
  })

  test('response.removeHeader() should throw if key is undefined', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      expect(() => {
        res.removeHeader()
      }).toThrow()
      done()
    })

    injectar(instance.lookup()).get('/test').end()
  })
})

describe('send()', () => {
  test('response.send() should set content-type correctly', async () => {
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
    let res
    res = await inject.get('/type-string').end()
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
    expect(res.payload).toBe(stringMsg)

    res = await inject.get('/type-buffer').end()
    expect(res.headers['content-type']).toBe('application/octet-stream')
    expect(res.payload).toBe(bufferMsg)

    res = await inject.get('/type-json').end()
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(res.json()).toStrictEqual(jsonMsg)
  })

  test('response.send() should throw if called multiple times', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.send('a')
      expect(() => {
        res.send('b')
      }).toThrow()
      done()
    })

    injectar(instance.lookup()).get('/test').end()
  })
})

describe('setHeader()', () => {
  test('response.setHeader() should set the given header correctly', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.setHeader('foo', 'bar').send()
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.headers.foo).toBe('bar')
        done()
      })
  })

  test('response.setHeader() should set multiple headers with the same name', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.setHeader('foo', ['bar', 'baz']).send()
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.headers.foo).toStrictEqual(['bar', 'baz'])
        done()
      })
  })

  test('response.setHeader() should throw if key is undefined', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      expect(() => {
        res.setHeader()
      }).toThrow()
      done()
    })

    injectar(instance.lookup()).get('/test').end()
  })
})

describe('setHeaders()', () => {
  test('response.setHeaders() should set the given headers correctly', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      res.setHeaders({
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
        done()
      })
  })

  test('response.setHeader() should throw if headers is not an object', (done) => {
    const instance = new Felid()
    instance.get('/test', (req, res) => {
      expect(() => {
        res.setHeaders()
      }).toThrow()
      expect(() => {
        res.setHeaders('headers')
      }).toThrow()
      expect(() => {
        res.setHeaders(null)
      }).toThrow()
      done()
    })

    injectar(instance.lookup()).get('/test').end()
  })
})
