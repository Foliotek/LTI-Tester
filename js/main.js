(function () {
	"use strict";
	
	$('.sidebar-handle').on('click', function () {
		$('body').toggleClass('open');
	});

	app.form.init();
	app.debug.init($("#form"));
})();