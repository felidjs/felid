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
