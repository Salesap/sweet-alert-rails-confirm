var sweetAlertConfirmConfig = window.sweetAlertConfirmConfig || {}; // Add default config object

(function($) {
  window.sweetAlertConfirm = function(event) {
    const swalOptions = {
      title: sweetAlertConfirmConfig.title || 'Are you sure?',
      type: sweetAlertConfirmConfig.type || 'warning',
      showCancelButton: sweetAlertConfirmConfig.showCancelButton || true,
      //confirmButtonColor: sweetAlertConfirmConfig.confirmButtonColor || null, //"#DD6B55" removed by Noc, do not apply default color as it triggers inline styles on buttons
      //Null causes javascript errors when hover is fired on confirm buttons
      confirmButtonText: sweetAlertConfirmConfig.confirmButtonText || "Ok",
      cancelButtonText: sweetAlertConfirmConfig.cancelButtonText || "Cancel"
    }
    if (sweetAlertConfirmConfig.confirmButtonColor !== null) {
      swalOptions.confirmButtonColor = sweetAlertConfirmConfig.confirmButtonColor;
    }

    let $linkToVerify;
    if ($(event.target).is('[data-sweet-alert-confirm]')) {
      $linkToVerify = $(event.target);
    } else {
      $linkToVerify = $(event.target).parents('[data-sweet-alert-confirm]');
    }

    const optionKeys = [
      'confirm',
      'text',
      'sweetAlertType',
      'showCancelButton',
      'confirmButtonColor',
      'cancelButtonColor',
      'confirmButtonText',
      'cancelButtonText',
      'closeOnConfirm',
      'html',
      'imageUrl',
      'allowOutsideClick',
      'customClass',
      'remote',
      'method',
      'function'
    ];

    function afterAlertCallback(r){
      if (nameFunction) {
        window[nameFunction]();
      }
      if (r === false) return false;
      if (swalOptions['remote'] === true) {
        $.rails.handleRemote($linkToVerify)
      }
      else if (swalOptions['method'] !== undefined) {
        $.rails.handleMethod($linkToVerify);
      }
      else {
        if ($linkToVerify.attr('type') === 'submit') {
          const name = $linkToVerify.attr('name');
          $linkToVerify
            .closest('form')
            .data('ujs:submit-button', name ? { name: name, value:$linkToVerify.val() } : null)
            .trigger('submit');
        }
        else {
          window.location.href = $linkToVerify.attr('href');
        }
      }
    }

    let beforeFunction;

    $.each($linkToVerify.data(), function(key, val) {
      if (optionKeys.includes(key)) {
        swalOptions[key] = val
        if (key === 'sweetAlertType') {
          swalOptions['type'] = val;
        }
      }
      // Make a before callback to verify that swal should be shown
      if(key === 'sabeforefunction') {
        beforeFunction = val;
      }
    });

    // Skip alert if false
    if (!!beforeFunction && typeof window[beforeFunction] === 'function') {
      if (window[beforeFunction]($linkToVerify) === true) {
        return afterAlertCallback(true); // Skip alert
      }
    }

    var nameFunction = swalOptions['function'];
    swalOptions['title'] = $linkToVerify.attr('data-sweet-alert-confirm');
    swal(swalOptions, afterAlertCallback);

    return false;
  }

  $(document).on('turbolinks:load page:update ajaxComplete', function() {
    $('[data-sweet-alert-confirm]').on('click', sweetAlertConfirm)
  });

  $(document).on('turbolinks:load page:load', function() {
    //To avoid "Uncaught TypeError: Cannot read property 'querySelector' of null" on turbolinks
    if (typeof window.sweetAlertInitialize === 'function') {
      window.sweetAlertInitialize();
    }
  });

  $(function() {
    $('[data-sweet-alert-confirm]').on('click', sweetAlertConfirm);

    //To avoid "Uncaught TypeError: Cannot read property 'querySelector' of null" on turbolinks
    if (typeof window.sweetAlertInitialize === 'function') {
      window.sweetAlertInitialize();
    }
  });

})(jQuery);
