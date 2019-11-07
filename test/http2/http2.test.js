const fs = require('fs')
const path = require('path')
const superagent = require('superagent')
const Felid = require('../../src')

test('felid should set up a http2 server', () => {
  const instance = new Felid({
    http2: true
  })

  instance.get('/test', (req, res) => {
    res.send('test')
  })

  instance.listen(0, () => {
    superagent
      .get(`http://localhost:${instance.address.port}/test`)
      .http2()
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.text).toBe('test')
        instance.close()
      })
  })
})

test('felid should set up an encrypted http2 server', () => {
  const key = fs.readFileSync(path.resolve(__dirname, '../https/felid.key'))
  const cert = fs.readFileSync(path.resolve(__dirname, '../https/felid.cert'))
  const instance = new Felid({
    http2: {
      key,
      cert
    }
  })

  instance.get('/test', (req, res) => {
    res.send('test')
  })

  instance.listen(0, () => {
    superagent
      .get(`https://localhost:${instance.address.port}/test`)
      .key(key)
      .ca(cert)
      .http2()
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.text).toBe('test')
        instance.close()
      })
  })
})
