const felid = require('../src')

const app = new felid()

app.get('/', (req, res) => {
  res.end('hello felid')
})

app.listen(8080)
console.log(`felid server listen on ${app.port}`)
