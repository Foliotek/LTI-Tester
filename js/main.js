(function () {
	"use strict";
	
	$('.sidebar-handle').on('click', function () {
		$('body').toggleClass('open');
	});

	app.form.init();

	$("#LaunchFrame").on('load', function (ev) {
		$(this).addClass('loaded');
		log($(this));
	});
})();