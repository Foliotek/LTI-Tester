(function (app) {
	var $sig = $("#debug-signature");
	var $sigBase = $("#debug-signature-base");

	function processForm ($form) {
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

		return {
			signatureBase: req.getSignatureBase(),
			signature: req.getSignature(secret)
		};
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