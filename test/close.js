

var CS = require('../')

var pull = require('pull-stream')

require('tape')('test close', function (t) {

  t.plan(10)

  var i = 10
  var cs = CS(null, pull.infinite().pipe(pull.through(null, function () {
    console.log('CLOSE')
    t.end()
  })))
  .on('data', function (data) {
    t.ok(data)
    if(!--i) cs.destroy()
  })

})
