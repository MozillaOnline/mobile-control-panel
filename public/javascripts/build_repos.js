
function initBuildReposPage() {
  function refreshAll() {
    updateZhCnMirrorStatus();
  }

  function updateZhCnMirrorStatus() {
    $.getJSON('/build/repos/getZhCnMirrorStatus.json', function(data) {
      console.info('updateZhCnMirrorStatus: ' + JSON.stringify(data));
      var statusHtml = '';
      var rowClass = '';
      switch (data.state) {
        case 'running': {
          var template = '<div class="progress progress-striped active">' +
                         '  <div class="bar" style="width: {0}%"></div>' +
                         '</div>';
          statusHtml = format(template, data.progress);
          rowClass = 'info';
          break;
        }
        case 'updated': {
          statusHtml = '<i class="icon-ok"></i> Updated';
          rowClass = 'success';
          break;
        }
        case 'outofdate': {
          statusHtml = 'Out-of-date';
          rowClass = 'warning';
          break;
        }
        case 'error': {
          statusHtml = '<i class="icon-remove"></i> Error';
          rowClass = 'error';
          break;
        }
      }
      var lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : '-';
      $('#zh-CN-mirror td:nth-child(3)').text(lastUpdated);
      $('#zh-CN-mirror td:nth-child(5)').html(statusHtml);
      $('#zh-CN-mirror').attr('class', rowClass);
      if (data.state == 'running') {
        $('#zh-CN-mirror button').addClass('disabled');
      } else {
        $('#zh-CN-mirror button').removeClass('disabled');
      }
    });
  }

  refreshAll();

  $('#zh-CN-mirror button').click(function() {
    if ($(this).hasClass('disabled')) {
      return false;
    }
    $.getJSON('/build/repos/startZhCnMirrorTask.json', function() {
      updateZhCnMirrorStatus();
    });
    return true;
  });

  socket.on('connected', function() {
    refreshAll();
  });

  socket.on('repo_state_change', function(data) {
    if (data == 'zh-CN-mirror') {
      updateZhCnMirrorStatus();
    }
  });
}

setTimeout(initBuildReposPage, 100);
