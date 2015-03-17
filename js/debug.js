(function (app) {
	var BITLY_TOKEN = 'c271dd924487c138fbe94d8fa07a38ba6475023e';
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

	function loadFormFromShare(share, form) {
		var baseString = atob(share);
		var baseSplit = baseString.split('&');
		var endpoint = decodeURIComponent(baseSplit[1]);
		var dataStr = decodeURIComponent(baseSplit[2]);
		var data = {
			endpoint: endpoint
		};
		dataStr.split('&').forEach(function (s) {
			var nvp = s.split('=');
			data[nvp[0]] = nvp[1];
		});

		console.log("loading from", data);
		Object.keys(data).forEach(function (k) {
			form.find("[name=" + k + "]").val(oauth_decode(data[k]));
		});
		$("body").addClass("open");
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
		
		$form.on('submit', function (ev) {
			var data = processForm($form);
			var b64 = btoa(data.signatureBase);

			var shareUrl = encodeURIComponent('http://foliotek.github.io/LTI-Tester?share=' + b64);
			var bitApiUrl = 'https://api-ssl.bitly.com/v3/shorten?access_token=' + BITLY_TOKEN + '&longUrl=' + shareUrl;
			$.get(bitApiUrl).done(function (resp ){
				if (resp.status_code === 200) {
                    $("#debug-link").html(resp.data.url);
					console.log(resp.data.url);
				}
				else {
                    $("#debug-link").html("Sorry, we have reached our daily limit.");
					console.error(resp.status_txt);
				}
			});
		});

		var parsedUrl = parseUri(window.location.toString());
		if (parsedUrl && parsedUrl.query && parsedUrl.query.share) {
			loadFormFromShare(parsedUrl.query.share, $form);
		}
	}

	app.debug = {};
	app.debug.init = init;

})(app);