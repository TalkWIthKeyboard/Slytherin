/**
 * Created by CoderSong on 17/6/5.
 */

$(document).ready(function () {
  var socket = io.connect('http://localhost:5000?type=Hall');

  $('#create').click(function () {
    socket.emit('create', JSON.stringify({
      'user': {'name': 'hehe'},
      'room': {'name': 'hello', 'number': 2}
    }));
  });

  $('#join').click(function () {
    socket.emit('join', JSON.stringify({
      'name': 'haha',
      'roomId': 1
    }))
  });

  socket.on('roomNumber', function (msg) {
    let message = JSON.parse(msg);
    let text = $('#text').val() + '\r\n'+ msg;
    $('#text').val(text);
  });

  socket.on('create', function () {
    jumpToNext();
  });

  socket.on('join', function () {
    jumpToNext();
  });

  socket.on('socketId', function (msg) {
    let text = $('#text').val() + '\r\n' + msg;
    $('#text').val(text);
  });
  
  function jumpToNext() {
    socket.emit('disconnect');
    window.location.href = '/h5/Room';
  }

  socket.on('enter', function (msg) {
    let text = $('#text').val() + '\r\n' + msg;
    $('#text').val(text);
  })
});

