var socket = io.connect('http://' + window.location.hostname + ':8080');
socket.on('connected', function() {
  console.log('Connected to the socket server.');
});
