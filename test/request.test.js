const injectar = require('injectar')
const Felid = require('../src')

test('request.header should return the given header value', () => {
  const instance = new Felid()
  instance.get('/test', (req, res) => {
    expect(req.header('foo')).toBe('bar')
    res.send()
  })

  injectar(instance.lookup())
    .get('/test')
    .headers({ foo: 'bar' })
    .end((err, res) => {
      expect(err).toBe(null)
    })
})
