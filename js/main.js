(function () {
	"use strict";

	var requiredFields = [
		'endpoint',
		'key',
		'secret',
		'resource_link_id',
		'resource_link_title',
		'resource_link_description',
		'user_id',
		'roles',
		'lis_person_sourcedid',
		'context_id',
		'context_title',
		'context_label'
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