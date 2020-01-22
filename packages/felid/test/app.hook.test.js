const injectar = require('injectar')
const Felid = require('../src')

// hook()

describe('preRequest()', () => {
  test('felid.preRequest() should fire correctly', (done) => {
    const instance = new Felid()
    let msg = ''
    instance.preRequest((req, res) => {
      msg += 'a'
      expect(msg).toBe('a')
    })
    instance.preRequest((req, res) => {
      msg += 'b'
      expect(msg).toBe('ab')
    })
    instance.get('/test', (req, res) => {
      msg += 'c'
      res.send(msg)
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('abc')
        done()
      })
  })

  test('felid.preRequest() should skip middlewares after return false', (done) => {
    const instance = new Felid()
    instance.preRequest((req, res) => {
      res.end('hack')
      return false
    })
    instance.get('/test', (req, res) => {
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('hack')
        done()
      })
  })
})

describe('use()', () => {
  test('felid.use() should apply a middleware for all routes', (done) => {
    const instance = new Felid()
    instance.use((req, res) => {
      res.code(201)
    })
    instance.get('/test', (req, res) => {
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(201)
        done()
      })
  })

  test('felid.use() should apply a list of middlewares', (done) => {
    const instance = new Felid()
    instance.use(
      (req, res) => {
        res.code(201)
      },
      (req, res) => {
        res.header('foo', 'bar')
      }
    )
    instance.get('/test', (req, res) => {
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(201)
        expect(res.headers.foo).toBe('bar')
        done()
      })
  })

  test('felid.use() should run middlewares in order as they defined', (done) => {
    const instance = new Felid()
    let msg = ''
    instance.use((req, res) => {
      msg += 'a'
    })
    instance.use(
      (req, res) => {
        msg += 'b'
      },
      (req, res) => {
        msg += 'c'
      }
    )
    instance.use((req, res) => {
      msg += 'd'
    })
    instance.get('/test', (req, res) => {
      msg += 'e'
      res.send(msg)
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('abcde')
        done()
      })
  })

  test('felid.use() should run middlewares in order as they defined', (done) => {
    const instance = new Felid()
    let msg = ''
    instance.use(
      (req, res, next) => {
        msg += 'a'
        next()
        msg += 'c'
      },
      (req, res) => {
        msg += 'b'
      }
    )
    instance.get('/test', (req, res) => {
      msg += 'd'
      res.send(msg)
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('abcd')
        done()
      })
  })

  test('felid.use() should skip middlewares in the same hook after invoking next(false)', async () => {
    const instance = new Felid()
    let msg = ''
    instance.use(
      (req, res, next) => {
        msg = 'a'
        if (req.url === '/return') {
          return next(false)
        } else {
          next(false)
        }
        msg += 'b'
      },
      (req, res) => {
        msg += 'c'
      }
    )
    instance.get('/return', (req, res) => {
      msg += 'd'
      res.send(msg)
    })
    instance.get('/no-return', (req, res) => {
      msg += 'd'
      res.send(msg)
    })

    const inject = injectar(instance.lookup())
    let res
    res = await inject.get('/return').end()
    expect(res.payload).toBe('ad')
    res = await inject.get('/no-return').end()
    expect(res.payload).toBe('abd')
  })

  test('felid.use() should skip middlewares after return false', (done) => {
    const instance = new Felid()
    instance.use((req, res) => {
      res.send('hack')
      return false
    })
    instance.get('/test', (req, res) => {
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('hack')
        done()
      })
  })
})

describe('route handler', () => {
  test('route handler should fire correctly', (done) => {
    const instance = new Felid()
    let msg = ''
    instance.preRequest((req, res) => {
      msg += 'a'
      expect(msg).toBe('a')
    })
    instance.postResponse((req, res) => {
      msg += 'c'
      expect(msg).toBe('abc')
      done()
    })
    instance.get('/test', (req, res) => {
      msg += 'b'
      res.send(msg)
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('ab')
      })
  })

  test('route handler should skip middlewares after return false', async () => {
    const instance = new Felid()
    let msg = ''
    instance.postResponse((req, res) => {
      msg += 'b'
    })
    instance.get('/test', (req, res) => {
      msg = 'a'
      res.send('test')
    })
    instance.get('/skip', (req, res) => {
      msg = 'c'
      res.send('test')
      return false
    })

    const inject = injectar(instance.lookup())
    await inject.get('/test').end()
    expect(msg).toBe('ab')
    await inject.get('/skip').end()
    expect(msg).toBe('c')
  })
})

describe('postResponse()', () => {
  test('felid.postResponse() should fire after response has been sent', (done) => {
    const instance = new Felid()
    instance.postResponse((req, res) => {
      expect(res.finished).toBe(true)
      done()
    })
    instance.get('/test', (req, res) => {
      res.send('test')
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('test')
      })
  })

  test('felid.postResponse() should fire correctly', (done) => {
    const instance = new Felid()
    let msg = ''
    instance.postResponse((req, res) => {
      msg += 'b'
      expect(msg).toBe('ab')
    })
    instance.postResponse((req, res) => {
      msg += 'c'
      expect(msg).toBe('abc')
      done()
    })
    instance.get('/test', (req, res) => {
      msg += 'a'
      res.send(msg)
    })

    injectar(instance.lookup())
      .get('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('a')
      })
  })
})
