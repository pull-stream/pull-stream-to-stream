var pull   = require('pull-stream')
var duplex = require('../')
var net    = require('net')

var test = require('tape')
/*
test('simple', function (t) {

  var server = net.createServer(function (stream) {
 
    stream.pipe(
    duplex(
      pull.map(function (e) {
        return '' + e
      }).pipe(pull.collect(function (err, ary) {
        console.log(ary)
        t.end()
      })),
      pull.infinite()
      .pipe(pull.asyncMap(function (e, cb) {
        process.nextTick(function () {
          cb(null, e.toString() + '\n')
        })
      }))
      .pipe(pull.take(10))
    )).on('end', function () {
      console.log('PULL -- END')
    })
    .pipe(stream).on('end', function () {
      server.close()
    })

  }).listen(0, function () {
    var stream = net.connect(server.address().port)
    stream.write('hello')
    stream.end()
  })
})
*/

test('header', function (t) {
  var a = []

  var server = net.createServer(function (stream) {
    var defer = pull.defer()

    stream.pipe(
      duplex(function (read) {
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
      }, defer)
      .on('end', function () {
        console.log('PULL -- END')
      })
    )
    .pipe(stream)

  }).listen(0, function () {
    var stream = net.connect(server.address().port)
    stream.write('10')
    var data = ''
    stream.on('data', function (d) {
      console.log('cData', '' + d)
      data += d
    })
    stream.on('end', function () {
      console.log('END !')
      stream.end()
      server.close()
      
      var nums = data.split('\n').map(Number)
      nums.pop()
      t.deepEqual(nums, a)
      t.end()
    })
  })
})

