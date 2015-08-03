(function (app){
	var F_PRE = "field_";
	var requiredFields = [
		{ field: 'endpoint', required: true },
		{ field: 'oauth_consumer_key', required: true },
		{ field: 'secret', required: true },
		'resource_link_id',
		'resource_link_title',
		'resource_link_description',
		'user_id',
		{ field: 'roles', required: true },
		'lis_person_name_full',
		'lis_person_name_family',
		'lis_person_name_given',
		'lis_person_contact_email_primary',
		'lis_person_sourcedid',
		'context_id',
		'context_title',
		'context_label'
	];
	var oauthFormTemplate = $("#oauth-form-template").html();
	var iFrameTemplate = $("#iframe-template").html();
	var customFieldTemplate = $("#custom-field-template").html();
	var formFieldTemplate = $("#form-field-template").html();

	function render ($form) {
		var fieldHtml = requiredFields.map(function (f) { // uses native array map.  Won't work in new browsers
			if (typeof(f) === 'string') {
				f = { field: f };
			}
			return Mustache.render(formFieldTemplate, f);
		}).join('');
		
		$("#field-holder").append(fieldHtml);
		$("#ls-clear").on('click', function (ev) {

            $form.find(".custom-field:not(:first)").each(function(){
                $(this).closest(".form-field.custom").remove();
            });
            
			$form.find("input[type=text]").each(function(){
                $(this).val('');
			});
		});
	}

	function renderCustomField($form, field, val) {
		var scroll = field === undefined;
		var html = Mustache.render(customFieldTemplate, {
			field: field,
			value: val
		});
		
		var el = $(html);
		if (scroll) {
			if ($form.find('.form-field.custom').length > 0) {
            	el.insertAfter($form.find(".form-field.custom:last"));
			}
			else {
				el.appendTo("#custom-field-holder");
			}
			$form.find(".sidebar-inner").scrollTo(".form-field.custom:last");
		}
		else {
            el.insertBefore($form.find(".form-field.custom:last"));
			var input = el.find(".custom-field");
			input.changeElementType("label", input.val()).before('<i class="fa fa-edit"></i>');
		}
        
        if (field) {
        	el.addClass('set');
        }
		return el;
	}

	function submitOauthForm($form) {
		var formObj = $form.serializeObject();
		var secret = formObj['secret'];
		var endpoint = formObj['endpoint'];
		delete formObj['secret']; 
		delete formObj['endpoint'];

		var req = new OAuthRequest({
			method: 'POST',
			action: endpoint,
			parameters: formObj
		});

		var reqData = req.getRequestData({ secret: secret });
		var formHtml = Mustache.render(oauthFormTemplate, {
			method: req.method,
			action: req.action,
			target: 'LaunchFrame',
			fields: Object.keys(reqData).map(function(k) {
				return {
					name: k,
					val: reqData[k]
				};
			})
		});

		var existing = $("#LaunchFrame");
		var newIframe = $(iFrameTemplate);
		if (existing.length) {
			existing.replaceWith(newIframe);
		}
		else {
			$("body").append(newIframe);
		}

		newIframe.on('load', function() {
			newIframe.addClass('loaded');
		});

		var formEl = $(formHtml).appendTo("body");
		formEl.submit();
		$("body").removeClass('advanced open help histories');
		setTimeout(function () {
			formEl.remove();
		}, 1000);
	}

	function bindSubmit ($form) {
		$form.on('submit', function (ev) {
			ev.preventDefault();
			var errorFields = $(this).find("input[name][aria-invalid=true]");
			if (errorFields.length) {
				errorFields.tooltipster({
					content: "This field is not unique"
				}).tooltipster("show");

				setTimeout(function() { 
					errorFields.tooltipster('destroy');
				}, 3000);
				return false;
			}
			app.history.add($form.serializeObject());
			submitOauthForm($form);
		});
	}
	
	function bindCustomFields ($form) {

		$form.on('keyup', '.form-field.custom:last input.custom-value', function (ev) {
			var input = $(ev.currentTarget);
			if (input.val()) {
				renderCustomField($form);
			}
		});
		
		$form.on("change", ".custom-field", function (ev) {
			var input = $(ev.currentTarget);
			var field = input.closest(".form-field");
			var fieldValue = field.find(".custom-value");
			var fieldName = input.val();
			if ($form.find("input[name='" + fieldName +"']").length) {
				fieldValue.attr("aria-invalid", true);
			}
			else {
				fieldValue.removeAttr("aria-invalid");
			}
			fieldValue.attr("name", fieldName);
		});

        $form.on('click', '.form-field.custom .btn-remove', function (ev) {
            if($(".form-field.custom").length > 1) {
        	   $(this).closest(".form-field.custom").remove();
            }
        });
		
		$form.on("blur", "input.custom-field", function (ev) {
			var input = $(ev.currentTarget);
			var value = input.val();
			if (value) {
				input.closest(".form-field").addClass("set");
				input.changeElementType("label", value).before('<i class="fa fa-edit"></i>');
			}
		});
		
		$form.on("click", "label.custom-field, i.fa-edit", function (ev) {
            var label = $(ev.currentTarget);
            if ($(this).is("i")) {
                label = $(ev.currentTarget).next();
            }
			
			var value = label.html();
			var input = label.changeElementType("input", value);
			input.closest(".form-field").removeClass("set");
			input.prev().remove();
			input.focus();
		});

		$("#custom-field-holder").html(Mustache.render(customFieldTemplate));
	}

	app.form = {};
	app.form.init = function () {
		var $form = $("#form");
		render($form);
		
		bindSubmit($form);		
		bindCustomFields($form);
	};

	app.form.fillValues = function (values) {
		$("#custom-field-holder").html("");
		var $form = $("#form");
		renderCustomField($form);
		Object.keys(values).forEach(function (k) {
			var input = $form.find("[name=" + k + "]");
			if (input.length > 0) {
				input.val(oauth_decode(values[k]));
			}
			else {
				renderCustomField($form, k, oauth_decode(values[k]));
			}
		});
	};

})(app);
