const injectar = require('injectar')
const Felid = require('../src')

describe('on()', () => {
  test('felid.on() should send response properly', (done) => {
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
        done()
      })
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

describe('all()', () => {
  test('felid.all() should add handler to all http methods', async () => {
    const instance = new Felid()
    instance.all('/test', (req, res) => {
      res.send(req.method)
    })
  
    const inject = injectar(instance.lookup())
    supportedHttpMethods.forEach(async method => {
      let res = await inject[method]('/test').end()
      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe(method.toUpperCase())
    })
  })
})

describe('http methods', () => {
  test('felid uses correct http method', async () => {
    const instance = new Felid()
    supportedHttpMethods.forEach(method => {
      instance[method]('/test', (req, res) => {
        res.send(req.method)
      })
    })
    
    const inject = injectar(instance.lookup())
    supportedHttpMethods.forEach(async method => {
      let res = await inject[method]('/test').end()
      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe(method.toUpperCase())
    })
  })
})
