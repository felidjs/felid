const Felid = require('../packages/felid/src')

const app = new Felid()

app.preRequest((req, res) => {
  console.log('before every route')
})

app.use((req, res) => {
  console.log('every route goes here')
})

app.postResponse((req, res) => {
  console.log('after every request has been responded')
})

app.get('/', (req, res) => {
  res.send('hello felid')
})

app.listen(8080, () => {
  console.log(`felid server listen on ${app.address.port}`)
})
