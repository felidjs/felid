const injectar = require('injectar')
const Felid = require('../src')

test('felid instance should be an object', () => {
  const instance = new Felid()

  expect(typeof instance).toBe('object')
})

// listen()
test('felid.listen() should start the server on the given port', () => {
  const instance = new Felid()
  instance.listen(3000, () => {
    expect(instance.listening).toBe(true)
    expect(instance.address.port).toBe(3000)
    instance.close()
  })
})

// addParser()
test('felid.addParser should apply parser to body of given content-type', () => {
  const instance = new Felid()
  instance.addParser('test/type', (req) => {
    return 'test'
  })
  instance.post('/test', (req, res) => {
    res.send(req.body)
  })

  injectar(instance.lookup())
    .post('/test')
    .headers({ 'content-type': 'test/type' })
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('test')
    })

  injectar(instance.lookup())
    .post('/test')
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('body')
    })
})

test('felid.addParser should apply parser to body of given list of content-type', () => {
  const instance = new Felid()
  instance.addParser(['test/type', 'test/type-a'], (req) => {
    return 'test'
  })
  instance.post('/test', (req, res) => {
    res.send(req.body)
  })

  injectar(instance.lookup())
    .post('/test')
    .headers({ 'content-type': 'test/type' })
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('test')
    })

  injectar(instance.lookup())
    .post('/test')
    .headers({ 'content-type': 'test/type-a' })
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('test')
    })

  injectar(instance.lookup())
    .post('/test')
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('body')
    })
})

test('felid.addParser should override the default parser of given content-type', () => {
  const instance = new Felid()
  instance.addParser('text/plain', (req) => {
    return 'test'
  })
  instance.post('/test', (req, res) => {
    res.send(req.body)
  })

  injectar(instance.lookup())
    .post('/test')
    .headers({ 'content-type': 'text/plain' })
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('test')
    })
})

test('felid.addParser should override the default parser', () => {
  const instance = new Felid()
  instance.addParser((req) => {
    return 'test'
  })
  instance.post('/test', (req, res) => {
    res.send(req.body)
  })

  injectar(instance.lookup())
    .post('/test')
    .body('body')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.payload).toBe('test')
    })
})

test('felid.addParser should throw if parser is not a function', () => {
  const instance = new Felid()
  expect(() => {
    instance.addParser('test/type', 'parser')
  }).toThrow()
})

// error handle
test('handle error thrown by felid.preRequest()', () => {
  const instance = new Felid()
  instance.preRequest((req, res) => {
    throw new Error('Boom!')
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(500)
      expect(res.payload).toBe('Boom!')
    })
})

test('handle error thrown by felid.use()', () => {
  const instance = new Felid()
  instance.use((req, res) => {
    throw new Error('Boom!')
  })
  instance.get('/test', (req, res) => {
    res.send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(500)
      expect(res.payload).toBe('Boom!')
    })
})
