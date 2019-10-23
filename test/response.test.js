const injectar = require('injectar')
const Felid = require('../src')

test('response.code should set correct status code', () => {
  const instance = new Felid()
  instance.on('get', '/test', (req, res) => {
    res.code(600).send()
  })

  injectar(instance.lookup.bind(instance))
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(600)
    })
})

test('response.redirect should redirect correctly', () => {
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

  const inject = injectar(instance.lookup.bind(instance))
  inject
    .get('/test')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toBe('/dest')
    })
  
  inject
    .get('/code-600')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.statusCode).toBe(600)
      expect(res.headers.location).toBe('/dest')
    })
})

test('response.send should set content-type correctly', () => {
  const instance = new Felid()
  
  instance.get('/type-string', (req, res) => {
    res.send('string')
  })
  instance.get('/type-buffer', (req, res) => {
    res.send(Buffer.from('a buffer'))
  })
  instance.get('/type-json', (req, res) => {
    res.send({ json: 'data' })
  })

  const inject = injectar(instance.lookup.bind(instance))
  inject
    .get('/type-string')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
    })
  
  inject
    .get('/type-buffer')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers['content-type']).toBe('application/octet-stream')
    })
  
  inject
    .get('/type-json')
    .end((err, res) => {
      expect(err).toBe(null)
      expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
    })
})
