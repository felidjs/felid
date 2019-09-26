const injectar = require('injectar')
const Felid = require('../src')

test('felid.on should send response properly', () => {
  const instance = new Felid()
  instance.on('get', '/test', (req, res) => {
    res.send('test')
  })

  injectar(instance.router.lookup.bind(instance.router))
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(200)
      expect(res.body).toBe('test')
    })
})

const httpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace'
]

test('felid.all should add handler to all http methods', () => {
  const instance = new Felid()
  instance.all('/test', (req, res) => {
    res.setHeader('method', req.method)
    res.send()
  })
  
  httpMethods.forEach(method => {
    injectar(instance.router.lookup.bind(instance.router))
      [method]('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.headers.method).toBe(method.toUpperCase())
      })
  })
})

test('felid uses correct http method', () => {
  const instance = new Felid()
  
  httpMethods.forEach(method => {
    instance[method]('/test', (req, res) => {
      res.setHeader('method', req.method)
      res.send()
    })
    injectar(instance.router.lookup.bind(instance.router))
      [method]('/test')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.headers.method).toBe(method.toUpperCase())
      })
  })
})
