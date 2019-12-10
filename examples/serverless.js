const Felid = require('../src')

const app = new Felid()

app.get('/', (req, res) => {
  res.send('hello felid')
})

module.exports = app.lookup()
