(function () {
	"use strict";
	var $body = $("body");
	$('#btn-config').on('click', function () {
		$body.toggleClass('open');
		if (!$body.is('.open')) {
			$body.removeClass('advanced');
		}
	});
	$('.hero-btn').on('click', function () {
		$body.addClass('open');
	});

	$("[title]").tooltipster({
    	theme: 'tooltipster-shadow'
	});

	app.form.init();
	app.debug.init($("#form"));
})();