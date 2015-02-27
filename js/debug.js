(function (app) {
	var $sig = $("#debug-signature");
	var $sigBase = $("#debug-signature-base");


	function processForm($form) {
		var formObj = $form.serializeObject();
		var key = {
			consumerSecret: formObj.secret
		};
		var msg = {
			method: 'POST',
			action: formObj.endpoint
		};

		delete formObj['secret'];
		delete formObj['endpoint'];
		formObj['oauth_nonce'] = OAuth.nonce(10);
		formObj['oauth_timestamp'] = OAuth.timestamp();
		formObj['oauth_version'] = '1.0';
		msg.parameters = Object.keys(formObj).map(function (k) {
			return [OAuth.decodePercent(k), OAuth.decodePercent(formObj[k] + '')];
		});
		OAuth.SignatureMethod.sign(msg, key);
		return {
			signatureBase: OAuth.SignatureMethod.getBaseString(msg),
			signature: OAuth.getParameter(msg.parameters, "oauth_signature")
		}
	}

	function inputChange(ev) {
		var target = $(ev.currentTarget);
		var form = target.closest('form');
		var data = processForm(form);
		$sig.html(data.signature);
		$sigBase.html(data.signatureBase);
	}

	function init ($form) {
		$form.on('change', 'input', $.throttle(1000, inputChange));
	}

	app.debug = {};
	app.debug.init = init;

})(app);