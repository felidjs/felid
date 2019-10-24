const injectar = require('injectar')
const Felid = require('../src')

// on
test('felid.on should send response properly', () => {
  const instance = new Felid()
  instance.on('get', '/test', (req, res) => {
    res.send('test')
  })

  injectar(instance.lookup())
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(200)
      expect(res.body).toBe('test')
    })
})

const supportedHttpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put'
]

// all
test('felid.all should add handler to all http methods', () => {
  const instance = new Felid()
  instance.all('/test', (req, res) => {
    res.header('method', req.method).send()
  })

  const inject = injectar(instance.lookup())
  supportedHttpMethods.forEach(method => {
    inject[method]('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.headers.method).toBe(method.toUpperCase())
      })
  })
})

// http methods
test('felid uses correct http method', () => {
  const instance = new Felid()
  supportedHttpMethods.forEach(method => {
    instance[method]('/test', (req, res) => {
      res.header('method', req.method).send()
    })
  })
  
  const inject = injectar(instance.lookup())
  supportedHttpMethods.forEach(method => {
    inject[method]('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.headers.method).toBe(method.toUpperCase())
      })
  })
})
