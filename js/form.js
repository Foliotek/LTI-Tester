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

	function render ($form) {
		var template = $("#form-field-template").html();
		var fieldHtml = requiredFields.map(function (f) { // uses native array map.  Won't work in new browsers
			if (typeof(f) === 'string') {
				f = { field: f };
			}
			return Mustache.render(template, f);
		}).join('');
		$("#field-holder").append(fieldHtml);
		
		
		$("#ls-load").on('click', function (ev) {
			ev.preventDefault();

			var custom_fields = (localStorage.getItem('tester_custom_fields') || '').split(',');
			custom_fields.forEach(function (f) {
				var exists = false;
				$(".custom-field").each(function(){
					if($(this).val() === f){
						exists = true;
						return;
					}
				});
				
				if(!exists && f !== ''){					
					renderAdd($form, f);
				}
			});

			Object.keys(localStorage).forEach(function (k) {
				var name = k.replace(F_PRE, '');
				$form.find("input[name='" + name +"']").val(localStorage.getItem(k)).trigger("change");
			});
		});
		
		$("#ls-clear").on('click', function (ev) {

            $form.find(".custom-field:not(:first)").each(function(){
                $(this).closest(".form-field.custom").remove();
            });
            
			$form.find("input[type=text]").each(function(){
                $(this).val('');
			});
		});
	}

	function renderAdd($form, field) {
		var scroll = field === undefined;
		var template = $("#custom-field-template").html();
		var html = Mustache.render(template, {
			field: field
		});
		
		if (scroll) {
            field = $(html).insertAfter($form.find(".form-field.custom:last"));
			$form.find(".sidebar-inner").scrollTo(".form-field.custom:last");
		}
		else {
            field = $(html).insertBefore($form.find(".form-field.custom:last"));
			var input = $(field.find(".custom-field"));
			input.changeElementType("label", input.val()).before('<i class="fa fa-edit"></i>');
		}
        
		return field;
	}

	function newOauth($form) {
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

		var formTemplate = '<form method="{{method}}" action="{{{action}}}" target="{{target}}" '
		+ 'enctype="application/x-www-form-urlencoded">'
		+ '{{#fields}}<input type="hidden" name="{{name}}" value="{{val}}" />{{/fields}}'
		+ '</form>';

		var reqData = req.getRequestData({ secret: secret });
		var formHtml = Mustache.render(formTemplate, {
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
		var newIframe = $($("#iframe-template").html());
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
			bindLocalStorage($form);
			newOauth($form);
			app.history.add($form.serializeObject());
		});
	}

	function bindLocalStorage ($form) {
		localStorage.clear();
		var customFields = $form.find(".custom-field").map(function(f, i) {
            log($(i).val());
			return $(i).val();
		}).toArray();
		localStorage.setItem('tester_custom_fields', customFields.join(','));
		
		$("input[name]").each(function (){
			var input = $(this);
			var name = F_PRE + input.attr("name");
			var val = input.val();
			if (val) {
				localStorage.setItem(name, val);
			}
			else {
				localStorage.removeItem(name);
			}
		});
	}
	
	function bindCustomFields ($form) {

		$form.on('keyup', '.form-field.custom:last input.custom-value', function (ev) {
			var input = $(ev.currentTarget);
			if (input.val()) {
				renderAdd($form);
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

		$("#custom-field-holder").html(Mustache.render($("#custom-field-template").html()));
	}

	app.form = {};
	app.form.init = function () {
		var $form = $("#form");
		render($form);
		
		bindSubmit($form);		
		bindCustomFields($form);
	};

	app.form.fillValues = function (values) {
		var $form = $("#form");
		Object.keys(values).forEach(function (k) {
			$form.find("[name=" + k + "]").val(oauth_decode(values[k]));
		});
	};

})(app);
