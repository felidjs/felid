const Felid = require('../src')

const app = new Felid()

app.get('/', (req, res) => {
  res.send('hello felid')
})

app.listen(8080, () => {
  console.log(`felid server listen on ${app.address.port}`)
})
