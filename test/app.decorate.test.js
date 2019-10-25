const Felid = require('../src')

// decorate()
test('felid.decorate() should add new property to the Felid instance', () => {
  const instance = new Felid()
  instance.decorate('key', 'value')
  instance.decorate('key2', 'value2')

  expect(instance.key).toBe('value')
  expect(instance.key2).toBe('value2')
})

test('felid.decorate() should throw if there is undefined argument', () => {
  const instance = new Felid()
  expect(() => {
    instance.decorate()
  }).toThrow()
  expect(() => {
    instance.decorate('key')
  }).toThrow()
})

test('felid.decorate() should throw if the Felid instance already has a property', () => {
  const instance = new Felid()
  instance.decorate('key', 'value')

  expect(() => {
    instance.decorate('key', 'another value')
  }).toThrow()
})

// decorateRequest()
test('felid.decorateRequest() should add new property to the Request object', () => {
  const instance = new Felid()
  instance.decorateRequest('key', 'value')
  instance.decorateRequest('key2', 'value2')

  instance.get('/test', (req, res) => {
    expect(req.key).toBe('value')
    expect(req.key2).toBe('value2')
  })
})

test('felid.decorateRequest() should throw if there is undefined argument', () => {
  const instance = new Felid()
  expect(() => {
    instance.decorateRequest()
  }).toThrow()
  expect(() => {
    instance.decorateRequest('key')
  }).toThrow()
})

test('felid.decorateRequest() should throw if the Request object already has a property', () => {
  const instance = new Felid()
  instance.decorateRequest('key', 'value')

  expect(() => {
    instance.decorateRequest('key', 'value2')
  }).toThrow()
})

// decorateResponse()
test('felid.decorateResponse() should add new property to the Response object', () => {
  const instance = new Felid()
  instance.decorateResponse('key', 'value')
  instance.decorateResponse('key2', 'value2')

  instance.get('/test', (req, res) => {
    expect(res.key).toBe('value')
    expect(res.key2).toBe('value2')
  })
})

test('felid.decorateResponse() should throw if there is undefined argument', () => {
  const instance = new Felid()
  expect(() => {
    instance.decorateResponse()
  }).toThrow()
  expect(() => {
    instance.decorateResponse('key')
  }).toThrow()
})

test('felid.decorateResponse() should throw if the Response object already has a property', () => {
  const instance = new Felid()
  instance.decorateResponse('key', 'value')

  expect(() => {
    instance.decorateResponse('key', 'another value')
  }).toThrow()
})

// hasDecorator()
test('felid.hasDecorator() should return if the given decorator exists in the Felid instance', () => {
  const instance = new Felid()
  instance.decorate('key', 'value')

  expect(instance.hasDecorator('key')).toBe(true)
  expect(instance.hasDecorator('noThisKey')).toBe(false)
})

// hasRequestDecorator()
test('felid.hasRequestDecorator() should return if the given decorator exists in the Request object', () => {
  const instance = new Felid()
  instance.decorateRequest('key', 'value')

  expect(instance.hasRequestDecorator('key')).toBe(true)
  expect(instance.hasRequestDecorator('noThisKey')).toBe(false)
})

// hasResponseDecorator()
test('felid.hasResponseDecorator() should return if the given decorator exists in the Response object', () => {
  const instance = new Felid()
  instance.decorateResponse('key', 'value')

  expect(instance.hasResponseDecorator('key')).toBe(true)
  expect(instance.hasResponseDecorator('noThisKey')).toBe(false)
})
