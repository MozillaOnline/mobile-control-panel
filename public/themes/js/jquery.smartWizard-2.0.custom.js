/*
 * SmartWizard 2.0 plugin
 * jQuery Wizard control Plugin
 * by Dipu 
 * 
 * Modified by Yuan Xulei on Dec 2013.
 *
 * http://www.techlaboratory.net 
 * http://tech-laboratory.blogspot.com
 */

(function($) {
  $.fn.smartWizard = function(action) {
    var options = $.extend({}, $.fn.smartWizard.defaults, action);
    var args = arguments;

    return this.each(function() {
      var obj = $(this);
      var curStepIdx = options.selected;
      var steps = $("ul > li > a", obj); // Get all anchors in this array
      var contentWidth = 0;
      var elmStepContainer;

      // Method calling logic
      if (!action || action === 'init' || typeof action === 'object') {
        init();
      } else if (action === 'setError') {
        var ar = Array.prototype.slice.call(args, 1);
        setError(ar[0].stepnum, ar[0].iserror);
        return true;
      } else {
        $.error('Method ' + action + ' does not exist');
      }

      function init() {
        var allDivs = obj.children('div'); //$("div", obj);
        obj.children('ul').addClass("anchor");
        allDivs.addClass("content");
        // Create Elements
        elmStepContainer = $('<div><iframe class="content"></iframe></div>').addClass("stepContainer");

        // highlight steps with errors
        if (options.errorSteps && options.errorSteps.length > 0) {
          $.each(options.errorSteps, function(i, n) {
            setError(n, true);
          });
        }


        //elmStepContainer.append(allDivs);
        obj.append(elmStepContainer);
        contentWidth = elmStepContainer.width();

        $(steps).bind("click", function(e) {
          if (steps.index(this) == curStepIdx) {
            return false;
          }
          var nextStepIdx = steps.index(this);
          var isDone = steps.eq(nextStepIdx).attr("isDone") - 0;
          if (isDone == 1) {
            LoadContent(nextStepIdx);
          }
          return false;
        });

        // Enable keyboard navigation
        if (options.keyNavigation) {
          $(document).keyup(function(e) {
            if (e.which == 39) { // Right Arrow
              doForwardProgress();
            } else if (e.which == 37) { // Left Arrow
              doBackwardProgress();
            }
          });
        }
        //  Prepare the steps
        prepareSteps();
        // Show the first slected step
        LoadContent(curStepIdx);
      }

      function prepareSteps() {
        if (!options.enableAllSteps) {
          $(steps, obj).removeClass("selected").removeClass("done").addClass("disabled");
          $(steps, obj).attr("isDone", 0);
        } else {
          $(steps, obj).removeClass("selected").removeClass("disabled").addClass("done");
          $(steps, obj).attr("isDone", 1);
        }

        $(steps, obj).each(function(i) {
          $(this).attr("rel", i + 1);
        });
      }

      function LoadContent(stepIdx) {
        var selStep = steps.eq(stepIdx);
        var ajaxurl = options.contentURL;
        var ajaxurl_data = options.contentURLData;
        var hasContent = selStep.data('hasContent');
        var stepNum = stepIdx+1;
        var allDivs = obj.children('div');
        if (ajaxurl && ajaxurl.length>0) {
            if (options.contentCache && hasContent) {
                showStep(stepIdx);
            } else {
                var ajax_args = {
                    url: ajaxurl,
                    type: options.ajaxType,
                    data: ({step_number : stepNum}),
                    dataType: "text",
                    
                    beforeSend: function(){
                    },
                    error: function(){
                    },
                    success: function(res){
                        if(res && res.length>0){
                            selStep.data('hasContent',true);
                            //_step($this, selStep).html(res);
                            //showStep(stepIdx);
                            elmStepContainer.append(res);
                        }
                    }
                };
                if (ajaxurl_data) {
                    ajax_args = $.extend(ajax_args, ajaxurl_data(stepNum));
                }
                $.ajax(ajax_args);
            }
        }
        showStep(stepIdx);
        
      }

      function showStep(stepIdx) {
        var selStep = steps.eq(stepIdx);
        var curStep = steps.eq(curStepIdx);
        if (stepIdx != curStepIdx) {
          if ($.isFunction(options.onLeaveStep)) {
            if (!options.onLeaveStep.call(this, $(curStep))) {
              return false;
            }
          }
        }

        var iframe = $(".stepContainer iframe");
        if (options.updateHeight) {
          elmStepContainer.height(iframe.outerHeight());
        }

        iframe.attr("src", $(selStep, obj).attr("href"));
        curStepIdx = stepIdx;
        SetupStep(curStep, selStep);
        return true;
      }

      function SetupStep(curStep, selStep) {
        $(curStep, obj).removeClass("selected");
        $(curStep, obj).addClass("done");

        $(selStep, obj).removeClass("disabled");
        $(selStep, obj).removeClass("done");
        $(selStep, obj).addClass("selected");
        $(selStep, obj).attr("isDone", 1);
        if ($.isFunction(options.onShowStep)) {
          if (!options.onShowStep.call(this, $(selStep))) {
            return false;
          }
        }
        return true;
      }

      function doForwardProgress() {
        var nextStepIdx = curStepIdx + 1;
        if (steps.length <= nextStepIdx) {
          if (!options.cycleSteps) {
            return false;
          }
          nextStepIdx = 0;
        }
        LoadContent(nextStepIdx);
        return true;
      }

      function doBackwardProgress() {
        var nextStepIdx = curStepIdx - 1;
        if (0 > nextStepIdx) {
          if (!options.cycleSteps) {
            return false;
          }
          nextStepIdx = steps.length - 1;
        }
        LoadContent(nextStepIdx);
        return true;
      }

      function setError(stepnum, iserror) {
        if (iserror) {
          $(steps.eq(stepnum - 1), obj).addClass('error')
        } else {
          $(steps.eq(stepnum - 1), obj).removeClass("error");
        }
      }

      
      return false;
    });
  };

  // Default Properties and Events
  $.fn.smartWizard.defaults = {
    selected: 0, // Selected Step, 0 = first step
    keyNavigation: true, // Enable/Disable key navigation(left and right keys are used if enabled)
    enableAllSteps: false,
    updateHeight: true,
    transitionEffect: 'fade', // Effect on navigation, none/fade/slide/slideleft
    cycleSteps: false, // cycle step navigation
    includeFinishButton: true, // whether to show a Finish button
    enableFinishButton: false, // make finish button enabled always
    errorSteps: [], // Array Steps with errors
    onLeaveStep: null, // triggers when leaving a step
    onShowStep: null, // triggers when showing a step
    onFinish: null // triggers when Finish button is clicked
  };

})(jQuery);
