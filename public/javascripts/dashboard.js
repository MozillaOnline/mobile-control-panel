function initDashboardPage() {
  function refreshAll() {
    refreshCalendar();
    refreshMailList();
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

  function updateMailNum(callback) {

    $.getJSON('/dashboard/getTotalNum.json', function(data) {
      var num = data.result;
      $('#total-mails').attr('title', num + ' total mail(s)').text(num);
      callback(num);
    });
  }

  function refreshMailList() {
    updateMailNum(function(num) {

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

  refreshAll();

  socket.on('mail', function(){
    refreshAll();
  });
}

setTimeout(initDashboardPage, 0);
