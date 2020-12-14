const Core = require('../src')

test('core instance should be an object', () => {
  const instance = new Core()

  expect(typeof instance).toBe('object')
})

describe('decorate()', () => {
  test('core.decorate() should add new property to the Core instance', () => {
    const instance = new Core()
    instance.decorate('key', 'value')
    instance.decorate('key2', 'value2')

    expect(instance.key).toBe('value')
    expect(instance.key2).toBe('value2')
  })

  test('core.decorate() should throw if there is undefined argument', () => {
    const instance = new Core()
    expect(() => {
      instance.decorate()
    }).toThrow()
    expect(() => {
      instance.decorate('key')
    }).toThrow()
  })

  test('core.decorate() should throw if the Core instance already has a property', () => {
    const instance = new Core()
    instance.decorate('key', 'value')

    expect(() => {
      instance.decorate('key', 'another value')
    }).toThrow()
  })

  test('core.decorate() should work regrardless of dependencies orders', () => {
    const instance = new Core()
    instance.decorate('moduleC', core => core.moduleA + ' ' + core.moduleB)
    instance.decorate('moduleB', core => 'moduleB')
    instance.decorate('moduleA', 'moduleA')

    expect(instance.moduleA).toBe('moduleA')
    expect(instance.moduleB).toBe('moduleB')
    expect(instance.moduleC).toBe('moduleA moduleB')
  })
})

describe('hasDecorator()', () => {
  test('core.hasDecorator() should return if the given decorator exists in the Core instance', () => {
    const instance = new Core()
    instance.decorate('key', 'value')

    expect(instance.hasDecorator('key')).toBe(true)
    expect(instance.hasDecorator('noThisKey')).toBe(false)
  })
})

describe('listen()', () => {
  test('core.listen() should start the server on the given port', (done) => {
    const instance = new Core()
    instance.listen(3000, () => {
      expect(instance.listening).toBe(true)
      expect(instance.address.port).toBe(3000)
      instance.close()
      done()
    })
  })

  test('core.listen() without a callback', () => {
    const instance = new Core()
    instance.listen(3000)
    expect(instance.listening).toBe(true)
    expect(instance.address.port).toBe(3000)
    instance.close()
  })
})

describe('plugin()', () => {
  test('core.plugin()\'s callback function should recieve the Core instance as first argument', () => {
    const instance = new Core()
    instance.plugin((instance, options) => {
      instance.decorate('foo', 'bar')
    })

    expect(instance.foo).toBe('bar')
  })

  test('core.plugin()\'s callback function should recieve the plugin options as second argument', () => {
    const instance = new Core()
    instance.plugin((instance, options) => {
      instance.decorate(options.key, options.value)
    }, { key: 'foo', value: 'bar' })

    expect(instance.foo).toBe('bar')
  })

  test('core.plugin() should handle async function correctly', () => {
    const instance = new Core()
    instance.plugin(async (instance, options) => {
      return new Promise((resolve, reject) => {
        instance.decorate('foo', 'bar')
        resolve()
      })
    })

    expect(instance.foo).toBe('bar')
  })
})

describe('close()', () => {
  test('core.close() should close the server', () => {
    const instance = new Core()
    expect(instance.listening).toBe(false)
    instance.listen(3000)
    expect(instance.listening).toBe(true)
    instance.close()
    expect(instance.listening).toBe(false)
  })

  test('core.close()\'s callback function should be called when the server is closed', (done) => {
    let isClosed = false
    const instance = new Core()
    instance.server.on('close', () => {
      isClosed = true
    })
    instance.listen(3000)
    instance.close((err) => {
      expect(err).toBe(undefined)
      expect(isClosed).toBe(true)
      done()
    })
  })
})
