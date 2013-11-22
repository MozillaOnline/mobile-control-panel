function initDashboardPage() {
  function refreshAll() {
    refreshCalendar();
  }

  function refreshCalendar() {
    $('.calendar').fullCalendar('removeEvents');
    $.getJSON('/dashboard/getLastThreeMonthSubjects.json', function(data) {
      var events = [];
      for (var i = 0; i < data.length; i++) {
        var mail = data[i];
        events.push({
          id: mail._id,
          title: mail.subject,
          start: mail.date,
          url: '/dashboard/mail?messageId=' + encodeURI(mail._id)
        });
      }
      $('.calendar').fullCalendar('addEventSource', events);
    });
  }

  // === Calendar === //
  $('.calendar').fullCalendar({
    editable: false,
    eventClick: function(event) {
      // opens events in a popup window
      window.open(event.url, 'Mail', 'width=700, height=600, scrollbars=yes');
      return false;
    }
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

  refreshAll();

  socket.on('mail', function(){
    refreshAll();
  });
}

setTimeout(initDashboardPage, 0);
