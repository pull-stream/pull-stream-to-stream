var pull     = require('pull-stream')
var duplex   = require('../')

var test = require('tape')

test('should start to flow when data listener is added', function (t) {
  var s = duplex(null, pull(pull.values(['hello'])))

  setTimeout(() => {
    s.on('data', (d) => {
      t.equal(d, 'hello')
      t.end()
    })
  }, 100)

  setTimeout(() => {
    t.fail('data event listener was not invoked')
    t.end()
  }, 200)
})
