/** DELTA ADMIN **/
$(document).ready(function() {
  $.ajaxSetup({
    cache: true
  });

  // ----- Sidebar navigation ---------------------//

  function switch_to_page(name) {
    // Hide the original page
    var pages = $('#mainBody > div > div');
    if (pages.length > 0) {
      pages.hide(200);
    }

    // Switch to the new page.
    var page = $('#' + name);
    if (page.length > 0) {
      if (page.is(':hidden')) {
        page.show(500);
      }
    } else {
      // Load the new page if not exist.
      $('#mainBody').append($('<div></div>').load(name + '.html'));
    }
  }

  // Load default page.
  var hash = window.location.hash || $('#mainBody').attr('data-default-page');
  switch_to_page(hash.substring(1));

  $(window).on('hashchange', function(){
    switch_to_page(window.location.hash.substring(1));
  });

  $('.submenu > a').click(function(e) {
    e.preventDefault();
    var submenu = $(this).siblings('ul');
    var li = $(this).parents('li');
    var submenus = $('#sidebar li.submenu ul');
    var submenus_parents = $('#sidebar li.submenu');
    if (li.hasClass('open')) {
      if (($(window).width() > 768) || ($(window).width() < 479)) {
        submenu.slideUp();
      } else {
        submenu.fadeOut(250);
      }
      li.removeClass('open');
    } else {
      if (($(window).width() > 768) || ($(window).width() < 479)) {
        submenus.slideUp();
        submenu.slideDown();
      } else {
        submenus.fadeOut(250);
        submenu.fadeIn(250);
      }
      submenus_parents.removeClass('open');
      li.addClass('open');
    }
  });

  var ul = $('#sidebar > ul');

  $('#sidebar > a').click(function(e) {
    e.preventDefault();
    var sidebar = $('#sidebar');
    if (sidebar.hasClass('open')) {
      sidebar.removeClass('open');
      ul.slideUp(250);
    } else {
      sidebar.addClass('open');
      ul.slideDown(250);
    }
  });

  // ----- Resize window related -----  //
  $(window).resize(function() {
    if ($(window).width() > 479) {
      ul.css({
        'display': 'block'
      });
      $('#content-header .btn-group').css({
        width: 'auto'
      });
    }
    if ($(window).width() < 479) {
      ul.css({
        'display': 'none'
      });
      fix_position();
    }
    if ($(window).width() > 768) {
      $('#user-nav > ul').css({
        width: 'auto',
        margin: '0'
      });
      $('#content-header .btn-group').css({
        width: 'auto'
      });
    }
  });

  if ($(window).width() < 468) {
    ul.css({
      'display': 'none'
    });
    fix_position();
  }
  if ($(window).width() > 479) {
    $('#content-header .btn-group').css({
      width: 'auto'
    });
    ul.css({
      'display': 'block'
    });
  }

  // ----- Tooltips ----- //
  $('.tip').tooltip();
  $('.tip-left').tooltip({
    placement: 'left'
  });
  $('.tip-right').tooltip({
    placement: 'right'
  });
  $('.tip-top').tooltip({
    placement: 'top'
  });
  $('.tip-bottom').tooltip({
    placement: 'bottom'
  });

  // ----- Search input typeahead ----- //
  $('#search input[type=text]').typeahead({
    source: ['Dashboard', 'Form elements', 'Common Elements', 'Validation', 'Wizard', 'Buttons', 'Icons', 'Interface elements', 'Support', 'Calendar', 'Gallery', 'Reports', 'Charts', 'Graphs', 'Widgets'],
    items: 4
  });

  //----- Fixes the position of buttons group in content header and top user navigation -----  //

  function fix_position() {
    var uwidth = $('#user-nav > ul').width();
    $('#user-nav > ul').css({
      width: uwidth,
      'margin-left': '-' + uwidth / 2 + 'px'
    });

    var cwidth = $('#content-header .btn-group').width();
    $('#content-header .btn-group').css({
      width: cwidth,
      'margin-left': '-' + uwidth / 2 + 'px'
    });
  }

  // ----- Style switcher ----- //
  $('#style-switcher i').click(function() {
    if ($(this).hasClass('open')) {
      $(this).parent().animate({
        marginRight: '-=220'
      });
      $(this).removeClass('open');
    } else {
      $(this).parent().animate({
        marginRight: '+=220'
      });
      $(this).addClass('open');
    }
    $(this).toggleClass('icon-arrow-left');
    $(this).toggleClass('icon-arrow-right');
  });

  $('#style-switcher a').click(function() {
    var style = $(this).attr('href').replace('#', '');
    $('.skin-color').attr('href', 'themes/style/unicorn.' + style + '.css');
    $(this).siblings('a').css({
      'border-color': 'transparent'
    });
    $(this).css({
      'border-color': '#aaaaaa'
    });
  });
});
