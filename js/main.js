(function () {
	"use strict";
	
	var sidebar = document.getElementById("sidebar");
	document.getElementById("handle").addEventListener("click", function (ev) {
  		var isOpen = sidebar.classList.contains("open");
		if (isOpen) {
			sidebar.classList.remove("open");
		}
		else {
			sidebar.classList.add("open");
		}
	});

	app.form.init();

	$("#LaunchFrame").on('load', function (ev) {
		$(this).addClass('loaded');
		log($(this));
	});
})();