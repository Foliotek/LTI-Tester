(function (app){
	var requiredFields = [
		'endpoint',
		'oauth_consumer_key',
		'secret',
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
			return Mustache.render(template, {field: f });
		}).join('');
		$form.prepend(fieldHtml);
	}
	function renderAdd($form, field) {
		var template = $("#form-add-template").html();
		var html = Mustache.render(template, {
			field: field
		});
		var field = $(html).insertBefore($form.find("#add"));
		return field;
	}
	function bindSubmit ($form) {
		$form.on('submit', function (ev) {
			ev.preventDefault();
			var formValues = $(this).serializeObject();
			var key = {
				consumerSecret: formValues['secret']
			};
			var message = {
				method: 'POST',
				action: formValues['endpoint']
			};

			delete formValues['secret'];
			delete formValues['endpoint'];
			formValues['oauth_nonce'] = OAuth.nonce(10);
			formValues['oauth_timestamp'] = OAuth.timestamp();
			formValues['oauth_version'] = '1.0';
			var formString = Object.keys(formValues).map(function(k) { return k + '=' + formValues[k]; }).join('&');
			message.parameters = OAuth.decodeForm(formString);
			OAuth.SignatureMethod.sign(message, key);

			// log("Foliotek's: " + formString);
			// log("Foliotek's: ", message);
			// log("normalizedParameters", OAuth.SignatureMethod.normalizeParameters(message.parameters));
			// log("signatureBaseString" , OAuth.SignatureMethod.getBaseString(message));
			// log("signature"           , OAuth.getParameter(message.parameters, "oauth_signature"));
			// log("authorizationHeader" , OAuth.getAuthorizationHeader("", message.parameters));
			// var postData = OAuth.SignatureMethod.normalizeParameters(message.parameters) + 
			// 				'&oauth_signature=' + OAuth.getParameter(message.parameters, "oauth_signature");

			var formTemplate = '<form method="{{method}}" action="{{{action}}}" target="{{target}}" '
			+ 'enctype="application/x-www-form-urlencoded">'
			+ '{{#fields}}<input type="hidden" name="{{name}}" value="{{val}}" />{{/fields}}'
			+ '</form>';

			var formHtml = Mustache.render(formTemplate, {
				method: 'POST',
				action: message.action,
				target: 'LaunchFrame',
				fields: OAuth.getParameterList(message.parameters).map(function(f) {
					return {
						name: f[0],
						val: f[1]
					};
				})
			});

			var formEl = $(formHtml).appendTo("body");
			formEl.submit();
			$("body").removeClass('open');
			setTimeout(function (){
				formEl.remove();
			}, 1000);
		});
	}

	function bindLocalStorage ($form) {
		$form.on("blur", "input[name]", function (ev) {
			var input = $(ev.currentTarget);
			var name = input.attr("name");
			var val = input.val();
			localStorage.setItem(name, val);
		});

		$("#ls-load").on('click', function (ev) {
			ev.preventDefault();

			var custom_fields = (localStorage.getItem('tester_custom_fields') || '').split(',');
			custom_fields.forEach(function (f) {
				renderAdd($form, f);
			});

			Object.keys(localStorage).forEach(function (k) {
				$form.find("input[name='" + k +"']").val(localStorage.getItem(k)).trigger("change");
			});
		});
	}
	
	function bindAdd ($form) {
		$form.on("click", "#add", function(){
			renderAdd($form);
		})
		
		$form.on("change", ".custom_field", function () {
			var customFields = $form.find(".custom_field").map(function(f, i) {
				return $(i).val();
			}).toArray();
			localStorage.setItem('tester_custom_fields', customFields.join(','));
			$(this).next().attr("name", $(this).val());
		});
		
	}

	app.form = {};
	app.form.init = function () {
		var $form = $("#form");
		render($form);
		
		bindSubmit($form);		
		bindAdd($form);
		bindLocalStorage($form);
	};

})(app);



// function sign(form) {
//     var accessor = { consumerSecret: form.consumerSecret.value
//                    , tokenSecret   : form.tokenSecret.value};
//     var message = { method: form.httpMethod.value
//                   , action: form.URL.value
//                   , parameters: OAuth.decodeForm(form.parameters.value)
//                   };
//     for (var e = 0; e < form.elements.length; ++e) {
//         var input = form.elements[e];
//         if (input.name != null && input.name.substring(0, 6) == "oauth_"
//             && input.value != null && input.value != ""
//             && (!(input.type == "checkbox" || input.type == "radio") || input.checked))
//         {
//             message.parameters.push([input.name, input.value]);
//         }
//     }
//     OAuth.SignatureMethod.sign(message, accessor);
//     showText("normalizedParameters", OAuth.SignatureMethod.normalizeParameters(message.parameters));
//     showText("signatureBaseString" , OAuth.SignatureMethod.getBaseString(message));
//     showText("signature"           , OAuth.getParameter(message.parameters, "oauth_signature"));
//     showText("authorizationHeader" , OAuth.getAuthorizationHeader("", message.parameters));
//     return false;
// }
// function showText(elementId, text) {
//     var child = document.createTextNode(text);
//     var element = document.getElementById(elementId);
//     if (element.hasChildNodes()) {
//         element.replaceChild(child, element.firstChild);
//     } else {
//         element.appendChild(child);
//     }
// }
// function freshTimestamp() {
//     document.request.oauth_timestamp.value = OAuth.timestamp();
// }
// function freshNonce() {
//     document.request.oauth_nonce.value = OAuth.nonce(11);
// }
