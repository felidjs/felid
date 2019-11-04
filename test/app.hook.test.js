const injectar = require('injectar')
const Felid = require('../src')

// hook()

// preRequest()
test('felid.preRequest() should fire correctly', () => {
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
    })
})

test('felid.preRequest() should skip middlewares after return false', () => {
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
    })
})

// use()
test('felid.use() should apply a middleware for all routes', () => {
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
    })
})

test('felid.use() should apply a middleware for a specific route', () => {
  const instance = new Felid()
  instance.use('/201', (req, res) => {
    res.code(201)
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })
  instance.get('/201', (req, res) => {
    res.send('test')
  })

  const inject = injectar(instance.lookup())
  inject.get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(200)
    })
  inject.get('/201')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(201)
    })
})

test('felid.use() should apply a middleware for a list of specific routes', () => {
  const instance = new Felid()
  instance.use(['/201-a', '/201-b'], (req, res) => {
    res.code(201)
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })
  instance.get('/201-a', (req, res) => {
    res.send('test')
  })
  instance.get('/201-b', (req, res) => {
    res.send('test')
  })

  const inject = injectar(instance.lookup())
  inject.get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(200)
    })
  inject.get('/201-a')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(201)
    })
  inject.get('/201-b')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(201)
    })
})

test('felid.use() should apply both global and route-specific middlewares', () => {
  const instance = new Felid()
  instance.use((req, res) => {
    res.header('foo', 'bar')
  })
  instance.use('/201', (req, res) => {
    res.code(201)
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })
  instance.get('/201', (req, res) => {
    res.send('test')
  })

  const inject = injectar(instance.lookup())
  inject.get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(200)
    })
  inject.get('/201')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(201)
      expect(res.headers.foo).toBe('bar')
    })
})

test('felid.use() should apply a list of middlewares', () => {
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
    })
})

test('felid.use() should run middlewares in order as they defined', () => {
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
    })
})

test('felid.use() should run middlewares in order as they defined', () => {
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
    })
})

test('felid.use() should skip middlewares in the same hook after invoking next(false)', () => {
  const instance = new Felid()
  instance.decorateRequest('msg', '')
  instance.use(
    (req, res, next) => {
      req.msg += 'a'
      if (req.url === '/return') {
        return next(false)
      } else {
        next(false)
      }
      req.msg += 'b'
    },
    (req, res) => {
      req.msg += 'c'
    }
  )
  instance.get('/return', (req, res) => {
    req.msg += 'd'
    res.send(req.msg)
  })
  instance.get('/no-return', (req, res) => {
    req.msg += 'd'
    res.send(req.msg)
  })

  const inject = injectar(instance.lookup())
  inject.get('/return')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('ad')
    })
  inject.get('/no-return')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('abd')
    })
})

test('felid.use() should skip middlewares after return false', () => {
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
    })
})

// route handler
test('route handler should fire correctly', () => {
  const instance = new Felid()
  let msg = ''
  instance.preRequest((req, res) => {
    msg += 'a'
    expect(msg).toBe('a')
  })
  instance.postResponse((req, res) => {
    msg += 'c'
    expect(msg).toBe('abc')
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

test('route handler should skip middlewares after return false', () => {
  const instance = new Felid()
  let msg = ''
  instance.postResponse((req, res) => {
    msg += 'b'
    expect(msg).toBe('ab')
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
  inject.get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })

  inject.get('/skip')
    .end((err, res) => {
      expect(err).toBe(null)
    })    
})

// postResponse()
test('felid.postResponse() should fire after response has been sent', () => {
  const instance = new Felid()
  instance.postResponse((req, res) => {
    expect(res.finished).toBe(true)
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
    })
})

test('felid.postResponse() should fire correctly', () => {
  const instance = new Felid()
  let msg = ''
  instance.postResponse((req, res) => {
    msg += 'b'
    expect(msg).toBe('ab')
  })
  instance.postResponse((req, res) => {
    msg += 'c'
    expect(msg).toBe('abc')
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
