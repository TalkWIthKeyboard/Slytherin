/**
 * Created by CoderSong on 17/6/16.
 */

$(document).ready(function () {
  let socket = io.connect('http://localhost:5000?type=Hall');
  let flag = false;
  $('#ready').click(function () {
    if (flag)
      socket.emit('ready');
    else
      socket.emit('noReady');
  });

  socket.on('ready', function (id) {
    let text = $('#text').val() + '\r\n'+ id;
    $('#text').val(text);
  });

  socket.on('noReady', function (id) {
    let text = $('#text').val() + '\r\n'+ id;
    $('#text').val(text);
  });
  
  socket.on('disconnect', function (id) {
    let text = $('#text').val() + '\r\n'+ id;
    $('#text').val(text);
  })
});