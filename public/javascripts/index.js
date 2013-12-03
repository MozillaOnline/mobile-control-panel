var socket = io.connect('http://' + window.location.hostname + ':8080');
socket.on('connected', function() {
  console.log('Connected to the socket server.');
});

/*
 * JavaScript equivalent to printf/string.format
 * http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
 * Usage:
 *   "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
 * outputs
 *   ASP is dead, but ASP.NET is alive! ASP {2}
 */
function format(str) {
  var args = Array.prototype.slice.call(arguments, 1);
  return str.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};
