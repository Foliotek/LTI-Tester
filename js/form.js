(function (app){
	var requiredFields = [
		{ field: 'endpoint', required: true },
		{ field: 'oauth_consumer_key', required: true },
		{ field: 'secret', required: true },
		'resource_link_id',
		'resource_link_title',
		'resource_link_description',
		'user_id',
		'roles',
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
				$(".custom_field").each(function(){
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
				$form.find("input[name='" + k +"']").val(localStorage.getItem(k)).trigger("change");
			});
		});
		
		$("#ls-clear").on('click', function (ev) {
			$form.find("input[type=text]").each(function(){
				
				if($(this).hasClass("custom_field")){
					$(this).closest(".form-field.custom").remove();
				}
				else{
					$(this).val('');
				}
			});
		});
		
	}
	function renderAdd($form, field) {
		var scroll = field === undefined;
		var template = $("#form-add-template").html();
		var html = Mustache.render(template, {
			field: field
		});
		var field = $(html).insertAfter($form.find(".form-field:last"));
		//TODO: FIX SCROLL
		if(scroll){
			$form.find(".sidebar-inner").scrollTo(".form-field:last");
		}
		else {
			var input = $(field.find(".custom_field"));
			input.changeElementType("label", input.val()).before('<i class="fa fa-edit"></i>');
		}
        
        $(".btn-remove").on('click', function (ev) {
        	$(this).closest(".form-field.custom").remove();
        });
        
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
		$("body").removeClass('open');
		setTimeout(function () {
			formEl.remove();
		}, 1000);
	}

	function bindSubmit ($form) {
		$form.on('submit', function (ev) {
			ev.preventDefault();
			bindLocalStorage($form);
			newOauth($form);
		});
	}

	function bindLocalStorage ($form) {
		localStorage.clear();
		var customFields = $form.find(".custom_field").map(function(f, i) {
			return $(i).val();
		}).toArray();
		localStorage.setItem('tester_custom_fields', customFields.join(','));
		
		$("input[name]").each(function (){
			var input = $(this);
			var name = input.attr("name");
			var val = input.val();
			localStorage.setItem(name, val);
		});
	}
	
	function bindAdd ($form) {
		$form.on("click", "#add", function(){
			renderAdd($form);
		})
		
		$form.on("change", ".custom_field", function () {
			$(this).next().attr("name", $(this).val());
		});
		
		
		$form.on("blur", "input.custom_field", function (ev) {
			var input = $(ev.currentTarget);
			var value = input.val();
			if(value){
				input.changeElementType("label", value).before('<i class="fa fa-edit"></i>');
			}
		});
		
		$form.on("click", "label.custom_field, i.fa-edit", function (ev) {
            var label = $(ev.currentTarget);
            if($(this).is("i")){
                label = $(ev.currentTarget).next();
            }
			
			var value = label.html();
			label.changeElementType("input", value).prev().remove();
		});
	}

	app.form = {};
	app.form.init = function () {
		var $form = $("#form");
		render($form);
		
		bindSubmit($form);		
		bindAdd($form);
	};

})(app);
