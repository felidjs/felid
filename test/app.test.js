const Felid = require('../src')

test('felid instance should be an object', () => {
  const instance = new Felid()

  expect(typeof instance).toBe('object')
})