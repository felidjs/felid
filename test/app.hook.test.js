const injectar = require('injectar')
const Felid = require('../src')

// hook()

// preRequest()

// use()
test('felid.use() should apply a middleware for all routes', () => {
  const instance = new Felid()
  instance.use((req, res) => {
    res.code(201)
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })

  injectar(instance.lookup().bind(instance))
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

  injectar(instance.lookup().bind(instance))
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(201)
      expect(res.headers.foo).toBe('bar')
    })
})

// postResponse()
