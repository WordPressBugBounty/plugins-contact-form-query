(function($) {
	'use strict';
	$(document).ready(function() {

		var loadingContainer = $('<span/>', {
			'class': 'st-loading-container'
		});
		var loadingImage = $('<img/>', {
			'src': stcfqvars.adminUrl + 'images/spinner.gif',
			'class': 'st-loading-image'
		});

		// Save contact message.
		$(document).on('submit', '.stcfq-save-contact-form', function(event) {
			event.preventDefault();
			var contactForm = this;
			var saveContactForm = $(this);
			var saveContactBtn = saveContactForm.find(':submit');
			var captcha = saveContactBtn.data('cpt');

			function showError(message) {
				var errorBox = $('<div/>', {
					'class': 'st-alert-message st-alert-error',
					'role': 'alert',
					'tabindex': '-1'
				}).append($('<strong/>').text(message));
				$('.st-alert-message').remove();
				errorBox.insertBefore(contactForm).focus();
			}

			function resetRecaptcha() {
				var recaptchaWidget = saveContactForm.find('.g-recaptcha');
				if('google_recaptcha_v2' !== captcha || !recaptchaWidget.length || 'undefined' === typeof grecaptcha || 'function' !== typeof grecaptcha.reset) {
					return;
				}
				grecaptcha.reset($('.g-recaptcha').index(recaptchaWidget));
			}

			function removeTurnstile() {
				var widgetId = saveContactForm.data('stcfqTurnstileId');
				if(undefined === widgetId) {
					return;
				}
				saveContactForm.removeData('stcfqTurnstileId');
				if('undefined' !== typeof turnstile) {
					turnstile.remove(widgetId);
				}
			}

			function cancelTurnstile(message) {
				removeTurnstile();
				saveContactBtn.prop('disabled', false);
				if(message) {
					showError(message);
				}
			}

			function submitForm(callback) {
				saveContactForm.ajaxSubmit({
					beforeSubmit: function(arr, $form, options) {
						$('.st-text-danger').remove();
						$('.st-is-invalid').removeClass("st-is-invalid");
						$('.st-alert-message').remove();
						saveContactBtn.prop('disabled', true);
						loadingContainer.insertAfter(saveContactBtn);
						loadingImage.appendTo(loadingContainer);
						return true;
					},
					success: function(response) {
						if(response.success) {
							var alertBox = '' +
							'<div class="st-alert-message st-alert-success" role="alert" tabindex="-1">' +
								'<strong>' + response.data.message + '</strong>' +
							'</div>';
							$(alertBox).insertBefore(contactForm).focus();
							saveContactForm[0].reset();
						} else {
							if(response.data && $.isPlainObject(response.data)) {
								saveContactForm.find(':input').each(function() {
									var input = this;
									$(input).removeClass('st-is-invalid');
									if(response.data[input.name]) {
										var errorSpan = '<div class="st-text-danger">' + response.data[input.name] + '</div>';
										if($(input).is(':checkbox')) {
											$(input).parent().parent().prepend(errorSpan);
										} else {
											$(input).addClass('st-is-invalid');
											$(errorSpan).insertAfter(input);
										}
									}
								});
							} else {
								var errorSpan = '' +
								'<div class="st-alert-message st-alert-error" role="alert" tabindex="-1">' +
									'<strong>' + response.data + '</strong>' +
								'</div>';
								$(errorSpan).insertBefore(contactForm).focus();
							}
						}
					},
					error: function(response) {
						saveContactBtn.prop('disabled', false);
						var errorSpan = '' +
						'<div class="st-alert-message st-alert-error" role="alert" tabindex="-1">' +
							'<strong>' + response.status + '</strong> ' + response.statusText +
						'</div>';
						$(errorSpan).insertBefore(contactForm).focus();
					},
					complete: function(event, xhr, settings) {
						if('function' === typeof callback) {
							callback();
						}
						resetRecaptcha();
						saveContactBtn.prop('disabled', false);
						loadingContainer.remove();
					}
				});
			}

			if('cf_turnstile' === captcha) {
				if(undefined !== saveContactForm.data('stcfqTurnstileId')) {
					return;
				}

				if('undefined' === typeof turnstile) {
					showError(stcfqvars.captchaLoadError);
					return;
				}

				saveContactBtn.prop('disabled', true);

				var widgetId = turnstile.render(saveContactForm.find('.stcfq-cf-turnstile')[0], {
					sitekey: saveContactBtn.data('site-key'),
					action: 'contact-form-query',
					theme: saveContactBtn.data('cpt-theme'),
					callback: function() {
						submitForm(removeTurnstile);
					},
					'error-callback': function() {
						cancelTurnstile(stcfqvars.captchaError);
					},
					'expired-callback': function() {
						cancelTurnstile();
					},
					'timeout-callback': function() {
						cancelTurnstile(stcfqvars.captchaError);
					}
				});

				if(undefined === widgetId) {
					cancelTurnstile(stcfqvars.captchaError);
					return;
				}

				saveContactForm.data('stcfqTurnstileId', widgetId);
			} else {
				submitForm();
			}
		});

	});
})(jQuery);
