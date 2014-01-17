
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

  // zh-CN-mirror

  $('#zh-CN-mirror button').click(function() {
    if ($(this).hasClass('disabled')) {
      return false;
    }

    $.getJSON('/build/repos/startZhCnMirrorTask.json', function() {
      updateZhCnMirrorStatus();
    });
    return false;
  });

  socket.on('connected', function() {
    refreshAll();
  });

  socket.on('repo_state_change', function(data) {
    if (data == 'zh-CN-mirror') {
      updateZhCnMirrorStatus();
    }
  });

  socket.on('start', function(data){
    
    var stepDescribe = '';
    var steps = data.split(';');
    for (var i=0; i< steps.length; i++) {
      stepDescribe = '<div id="step-' + i + '">';
      stepDescribe += '<h2 class="StepTitle">Step ' + steps[i] + ' Content</h2>';
      stepDescribe += '<p></p>';
      stepDescribe += '</div>';
      $('.stepContainer').append(stepDescribe);
    }
    
  })
  
$('#zh-CN-mirror').click(function(){
  $.getJSON('/build/repos/getProgressDetail.json',{file:'raw'}, function(data) {
  //  if ($.isEmptyObject(data) || Object.keys(data).length == 0) {
  //    alert('Update is not running!');
  //  } else {
      var html = '<li><a href="#command-output?step=step-1"><span class="stepNumber">1</span><span class="stepDesc">go</span></a></li>';
      $('#task-details-wizard #steps-list li').remove();
      $('#task-details-wizard #steps-list').append(html);
      $('#task-details-wizard').smartWizard({
        // Properties
        //contentURL:'public/content?file=raw',
        keyNavigation: true, // Enable/Disable key navigation(left and right keys are used if enabled)
        enableAllSteps: true,  // Enable/Disable all steps on first load
        transitionEffect: 'fade', // Effect on navigation, none/fade/slide/slideleft
        enableFinishButton: true, // makes finish button enabled always
        errorSteps:[3],
        // Events
        onLeaveStep: null, // triggers when leaving a step
        onShowStep: null  // triggers when showing a step
      });
   // }
    });
  });
  
}

setTimeout(initBuildReposPage, 100);
