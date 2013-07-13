var pull   = require('pull-stream')
var duplex = require('../')
var net    = require('net')

var test = require('tape')

test('header', function (t) {
  var a = []

  var server = net.createServer(function (stream) {
    var defer = pull.defer()

    var d = duplex()
      .on('end', function () {
        console.log('PULL -- END')
      })

    stream.pipe(d).pipe(stream)

    defer.pipe(d.sink) //pass output to source

    //pull one item "HEADER" from source.
    d.source.pipe(function (read) {
      read(null, function (err, len) {
        defer.resolve(
          pull.infinite()
          .pipe(pull.take(Number(len)))
          .pipe(pull.map(function (n) {
            a.push(n)
            return n + '\n'
          }))
        )
      })
    })

  }).listen(0, function () {
    var stream = net.connect(server.address().port)
    stream.write(String(~~(Math.random() * 50)))
    var data = ''
    stream.on('data', function (d) {
      console.log('cData', '' + d)
      data += d
    })
    stream.on('end', function () {
      server.close()
      console.log('END !')
      //stream.end()
      //server.close()
      var nums = data.split('\n').map(Number)
      nums.pop()
      t.deepEqual(nums, a)
      t.end()
    })
  })
})

