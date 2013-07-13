
var Stream = require('stream')
var addPipe = require('pull-core').addPipe

module.exports = duplex

var next = (
  'undefined' === typeof setImmediate
  ? process.nextTick
  : setImmediate
)

function duplex (reader, read) {
  var cbs = [], input = [], ended
  var s = new Stream()
  s.writable = s.readable = true
  s.write = function (data) {
    if(cbs.length)
      cbs.shift()(null, data)
    else
      input.push(data)
    return !! cbs.length
  }

  s.end = function () {
    if(read)
      read(ended = true, cbs.length ? cbs.shift() : function () {})
    else if(cbs.length)
      cbs.shift()(true)      
  }

  s.source = addPipe(function (end, cb) {
    if(input.length) {
      cb(null, input.shift())
      if(!input.length)
        s.emit('drain')
    }
    else if(ended = ended || end)
      cb(ended)
    else
      cbs.push(cb)
  })

  if(reader) reader(s.source)

  var output = [], _cbs = []
  var _ended = false, waiting = false

  s.sink = function (_read) {
    read = _read
    next(drain)
  }

  if(read) s.sink(read)

  function drain () {
    waiting = false
    if(!read) return
    while(output.length && !s.paused) {
      s.emit('data', output.shift())
    }
    if(s.paused) return
    if(_ended)
      return s.emit('end')

    read(null, function next (end, data) {
      if(s.paused) {
        if(end === true) _ended = end
        else if(end) s.emit('error', end)
        else output.push(data)
        waiting = true
      } else {
        if(end && (ended = end) !== true)
          s.emit('error', end)
        else if(ended = ended || end) s.emit('end')
        else {
          s.emit('data', data)
          read(null, next)
        }
      }
    })
  }

  s.pause = function () {
    s.paused = true
    return s
  }

  s.resume = function () {
    s.paused = false
    drain()
    return s
  }

  s.destroy = function () {
    if(!ended && read)
      read(ended = true, function () {})
    ended = true
    if(cbs.length)
      cbs.shift()(true)

    s.emit('close')
  }

  return s
}
