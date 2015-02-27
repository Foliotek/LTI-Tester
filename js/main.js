(function () {
	"use strict";

	var requiredFields = [
		'url',
		'key',
		'secret',
		'resourceLinkId',
		'resourceLinkTitle',
		'resourceLinkDescription',
		'userId',
		'roles',
		'sourcedId',
		'contextId',
		'contextTitle',
		'contextLabel'
	];

	var template = $("#form-field-template").html();
	var fieldHtml = requiredFields.map(function (f) { // uses native array map.  Won't work in new browsers
		return Mustache.render(template, {field: f });
	}).join('');

	$("#form").prepend(fieldHtml);
	
	
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
	
})();