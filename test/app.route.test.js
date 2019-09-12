const inject = require('light-my-request')
const Felid = require('../src')

test('felid.on should send response properly', () => {
  const instance = new Felid()
  instance.on('get', '/test', (req, res) => {
    res.send('test')
  })

  inject(instance.router.lookup.bind(instance.router),
    { method: 'get', url: '/test' },
    (err, res) => {
    expect(err).toBe(null)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe('test')
  })
})