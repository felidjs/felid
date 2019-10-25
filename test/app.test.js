const Felid = require('../src')

test('felid instance should be an object', () => {
  const instance = new Felid()

  expect(typeof instance).toBe('object')
})

// listen()
test('felid.listen() should listen on the given port', () => {
  const instance = new Felid()
  instance.listen(3000, () => {
    expect(instance.address.port).toBe(3000)
  })
})
