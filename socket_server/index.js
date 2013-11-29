/**
 * Module dependencies.
 */

var io = require('socket.io').listen(8080);

exports.broadcast = function(message, data) {
  if (clientNum > 0) {
    io.sockets.emit(message, data);
  }
};

var clientNum = 0;

io.sockets.on('connection', function(socket) {
  clientNum++;
  console.log('Client connected. Total client number: ' + clientNum);
  socket.emit('connected');
  socket.on('disconnect', function() {
    clientNum--;
    console.log('Client disconnected. Total client number: ' + clientNum);
  });
});
