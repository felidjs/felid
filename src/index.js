const router = require('./router')
const server = require('./server')

// listen
// get post

function felid (options = {}) {
  this.options = {
    ...options
  }

  this.router = router({})
}

felid.prototype.listen = function (port) {
  this.server = server({}, (req, res) => {
    this.router.lookup(req, res)
  })
  this.server.listen(port)
  this.port = port
}

felid.prototype.on = function (method, url, handler) {
  return this.router.on(method, url, handler)
}

felid.prototype.all = function (url, handler, store) {
  return this.router.all(url, handler, store)
}

felid.prototype.delete = function (url, handler) {
  return this.router.delete(url, handler)
}

felid.prototype.get = function (url, handler) {
  return this.router.get(url, handler)
}

felid.prototype.post = function (url, handler) {
  return this.router.post(url, handler)
}

felid.prototype.put = function (url, handler) {
  return this.router.put(url, handler)
}

module.exports = felid
