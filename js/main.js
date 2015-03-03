(function () {
	"use strict";
	
	$('.sidebar-handle').on('click', function () {
		$('body').toggleClass('open');
	});

	$("[title]").tooltipster({
    	theme: 'tooltipster-shadow'
	});

	app.form.init();
	app.debug.init($("#form"));
})();