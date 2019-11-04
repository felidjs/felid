const fs = require('fs')
const path = require('path')
const superagent = require('superagent')
const Felid = require('../../src')

test('felid should set up a https server', () => {
  const key = fs.readFileSync(path.resolve(__dirname, 'felid.key'))
  const cert = fs.readFileSync(path.resolve(__dirname, 'felid.cert'))
  const instance = new Felid({
    https: {
      key,
      cert
    }
  })

  instance.get('/test', (req, res) => {
    res.send('test')
  })

  instance.listen(8088, () => {
    superagent
      .get(`https://localhost:${instance.address.port}/test`)
      .key(key)
      .ca(cert)
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.statusCode).toBe(200)
        expect(res.text).toBe('test')
        instance.close()
      })
  })
})
