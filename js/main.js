(function () {
	"use strict";
	
	$('.sidebar-handle').on('click', function () {
		$('body').toggleClass('open');
	});

	app.form.init();
	app.debug.init($("#form"));

	$("#LaunchFrame").on('load', function (ev) {
		$(this).addClass('loaded');
	});
})();