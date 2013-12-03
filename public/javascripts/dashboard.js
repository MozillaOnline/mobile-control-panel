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

  // Fetch the total mail number.
  function updateMailNum(callback) {
    $.getJSON('/dashboard/getTotalNum.json', function(data) {
      var num = data.result;
      $('#total-mails').attr('title', num + ' total mail(s)').text(num);
      callback(num);
    });
  }

  // Each page show 6 mails.
  const kMailsPerPage = 6;
  var currentMailPage = 1;

  function refreshMailList() {
    // Fetch the total mail number.
    updateMailNum(function(num) {
      // Calculate total page number.
      var pageNum = Math.ceil(num / kMailsPerPage) || 1;
      if (currentMailPage > pageNum) {
        currentMailPage = pageNum;
      }
      $('#mail-pagination').bootstrapPaginator({
        alignment: 'right',
        currentPage: currentMailPage,
        numberOfPages: 3,
        totalPages: pageNum
      });
      showMailPage(currentMailPage);
    });
  }

  // Fetch the mail data of the given page and show the page.
  function showMailPage(pageNum) {
    var offset = kMailsPerPage * (pageNum - 1);
    var url = '/dashboard/getMails.json?offset=' + offset + '&count=' +
      kMailsPerPage;
    $.getJSON(url, function(data) {
      $('.recent-posts').empty();
      var template = '<li><div class="article-post">' +
                     '<span class="user-info">From {0} on {1}</span>' +
                     '<p><a href="/dashboard/mail?messageId={2}">{3}</a></p>' +
                     '</div></li>'

      for (var i = 0; i < data.length; i++) {
        var mail = data[i];
        var child = format(template, mail.from, new Date(mail.date), mail._id, mail.subject);
        $('.recent-posts').append(child);
      }
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

  // === Recent mail list === //
  $('#mail-pagination').bootstrapPaginator({
    alignment: 'right',
    currentPage: 1,
    numberOfPages: 3,
    totalPages: 1,
    shouldShowPage: true,
    onPageChanged: function(e, oldPage, newPage) {
      currentMailPage = newPage;
      showMailPage(currentMailPage);
    }
  });
  // Hook the the mail link to let user open a new window to read the mail
  // content.
  $('#mails').on('click', 'a', function() {
    window.open(this.href, 'child', 'width=700, height=600, scrollbars=yes');
    return false;
  });

  // Set up the click event handler for "clear old mails" confirmation button
  $('#clear-old-mails-btn').click(function() {
    $.getJSON('/dashboard/clearOldMails.json').fail(function() {
      alert('Failed to proceed the operation.');
    }).always(function() {
      $('#clear-old-mails-modal').modal('hide');
    });
  });

  refreshAll();

  socket.on('connected', function() {
    refreshAll();
  });

  socket.on('mail', function() {
    refreshAll();
  });
}

setTimeout(initDashboardPage, 100);
