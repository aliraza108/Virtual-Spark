// assets/js/ajax-form.js
$(function() {
  var form = $('#contact-form');
  var formMessages = $('.ajax-response');
  var submitBtn = $('#submit');

  // If the form isn't found, bail
  if (!form.length) return;

  form.on('submit', function(e) {
    e.preventDefault(); // crucial: prevent normal navigation

    // Clear previous messages
    formMessages.removeClass('success error').text('');

    // Disable button to prevent double submit
    if (submitBtn.length) submitBtn.prop('disabled', true).addClass('loading');

    var formData = form.serialize();

    $.ajax({
      type: 'POST',
      url: form.attr('action'),    // /mail.php
      data: formData,
      dataType: 'json',
      cache: false,
      timeout: 15000
    })
    .done(function(response) {
      if (response && response.status === 'success') {
        formMessages.removeClass('error').addClass('success').text(response.message || 'Thanks — saved!');
        form[0].reset(); // clear form
        // optionally hide message after 4 seconds
        setTimeout(function() {
          formMessages.fadeOut(300, function(){ $(this).show().text('').removeClass('success'); });
        }, 4000);
      } else {
        var m = (response && response.message) ? response.message : 'Submission failed.';
        formMessages.removeClass('success').addClass('error').text(m);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      var msg = 'Oops! An error occurred.';
      try {
        var json = jqXHR.responseJSON;
        if (json && json.message) msg = json.message;
        else if (jqXHR.responseText) msg = jqXHR.responseText;
      } catch (e) {}
      formMessages.removeClass('success').addClass('error').text(msg);
    })
    .always(function() {
      if (submitBtn.length) submitBtn.prop('disabled', false).removeClass('loading');
    });
  });
});
