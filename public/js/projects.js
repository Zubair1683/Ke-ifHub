
// If title visible show paragraph and hide title , if paragraph visible show title and hide paragraph when you clicked
$(document).ready(function () {
  $('.infobutton').click(function () {
    var $h1 = $('.ProjectVInfo h1');
    var $p = $('.ProjectVInfo p');

    if ($h1.hasClass('normal')) {
      $h1.removeClass('normal');
      $h1.addClass('hide');
      $('.infobutton').html('Back <i class="fa fa-refresh"></i>');
    } else {
      $h1.removeClass('hide');
      $h1.addClass('normal');
      $('.infobutton').html('Info <i class="fa fa-refresh"></i>');
    }

    if ($p.hasClass('normal')) {
      $p.removeClass('normal');
      $p.addClass('hide');
    } else {
      $p.removeClass('hide');
      $p.addClass('normal');
    }

    $('.ProjectVInfo').toggleClass('rotate');
    $('.infobutton').toggleClass('buttonrotate');
    $h1.toggleClass('rotate');
    $p.toggleClass('rotate');

  });
});











