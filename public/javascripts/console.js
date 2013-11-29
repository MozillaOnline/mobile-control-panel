function initConsolePage() {
  function refreshOutput() {
    $('#console-output').load('/console/refresh');
  }

  $('#console-refresh-btn').click(function() {
    refreshOutput();
  });

  $('#console-form').submit(function(evt) {
    var input = $('input[name="cmd"]');
    var cmd = input.val().trim();
    if (cmd) {
      $.post('/console/run', $(this).serialize()).done(function(data) {
        input.val('');
        refreshOutput();
      }).fail(function() {
        alert('Failed to run command.');
      });
    }
    input.val(cmd);
    evt.preventDefault();
  });

  refreshOutput();

  socket.on('cmd_done', function(){
    refreshOutput();
  });

  socket.on('connected', function() {
    refreshOutput();
  });
}

setTimeout(initConsolePage, 100);
