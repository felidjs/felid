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
  let order = ''
  instance.use((req, res) => {
    order += 'a'
  })
  instance.use(
    (req, res) => {
      order += 'b'
    },
    (req, res) => {
      order += 'c'
    }
  )
  instance.use((req, res) => {
    order += 'd'
  })
  instance.get('/test', (req, res) => {
    order += 'e'
    res.send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(order).toBe('abcde')
    })
})

test('felid.use() should run middlewares in order as they defined', () => {
  const instance = new Felid()
  let order = ''
  instance.use(
    (req, res, next) => {
      order += 'a'
      next()
      order += 'c'
    },
    (req, res) => {
      order += 'b'
    }
  )
  instance.get('/test', (req, res) => {
    order += 'd'
    res.send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(order).toBe('abcd')
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
