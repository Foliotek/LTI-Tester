// dependency sha1.js
(function () {
	var OAUTH_VERSION = "1.0";
	var NONCE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

	function oauth_encode(s) {
        if (s == null) {
            return "";
        }
        if (s instanceof Array) {
            var e = "";
            for (var i = 0; i < s.length; ++s) {
                if (e != "") e += '&';
                e += oauth_encode(s[i]);
            }
            return e;
        }
        s = encodeURIComponent(s);
        // Now replace the values which encodeURIComponent doesn't do
        // encodeURIComponent ignores: - _ . ! ~ * ' ( )
        // OAuth dictates the only ones you can ignore are: - _ . ~
        // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
        s = s.replace(/\!/g, "%21");
        s = s.replace(/\*/g, "%2A");
        s = s.replace(/\'/g, "%27");
        s = s.replace(/\(/g, "%28");
        s = s.replace(/\)/g, "%29");
        return s;
    };

    function oauth_decode(s) {
		if (s != null) {
            // Handle application/x-www-form-urlencoded, which is defined by
            // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
            s = s.replace(/\+/g, " ");
        }
        return decodeURIComponent(s);
    };

    function processParameters (params) {
		var ret = {};
		var ordered = {};
    	if (typeof(params) === 'string') {
    		params = params.split('&');
    	}

    	if (params.length > 0) {
    		params.forEach(function (s) {
    			var a = s.split('=');
    			ret[a[0]] = a[1];
    		});
    	}

    	if (typeof(params) === "object") {
    		ret = params;
    	}

    	return ret;
    };

    function parameterString (parameters) {
    	return Object.keys(parameters).sort().map(function (s) {
    		return oauth_encode(s) + '=' + oauth_encode(parameters[s]);
    	}).join('&');
    }

    function OAuthRequest (opts) { 
    	this.setMethod(opts.method);
    	this.setAction(opts.action);
    	this.setParameters(opts.parameters);
    };
    OAuthRequest.prototype.setMethod = function (method) {
    	this.method = method;
    };
    OAuthRequest.prototype.setAction = function (action) {
    	this.action = action;
	};
    OAuthRequest.prototype.setParameters = function (params) {
    	this.parameters = processParameters(params);
	};

	OAuthRequest.prototype.nonce = function (len) {
		var chars = NONCE_CHARS;
        var result = "";
        for (var i = 0; i < len; ++i) {
            var rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum+1);
        }
        return result;
	};
	OAuthRequest.prototype.timestamp = function() {
        var t = (new Date()).getTime(); // + OAuth.timeCorrectionMsec;
        return Math.floor(t / 1000);
    };
    OAuthRequest.prototype.getSignatureBase = function () {
    	if (!this.parameters['oauth_version']) { //check if the oauth params exist
	    	this.setOAuthParams();
	    }
		return oauth_encode(this.method.toUpperCase())
			+ '&' + oauth_encode(this.action)
			+ '&' + oauth_encode(parameterString(this.parameters));
    };
    OAuthRequest.prototype.getSignature = function (secret, token) {
    	if (!secret && !token) {
    		return '';
    	}
    	var key = oauth_encode(secret) + '&' + oauth_encode(token);
    	b64pad = "=";
    	return b64_hmac_sha1(key, this.getSignatureBase());
	};
	OAuthRequest.prototype.setOAuthParams = function () {
		this.parameters['oauth_version'] = OAUTH_VERSION;
    	this.parameters['oauth_nonce'] = this.nonce(10);
    	this.parameters['oauth_timestamp'] = this.timestamp();
    	this.parameters['oauth_signature_method'] = 'HMAC-SHA1';
	};
    OAuthRequest.prototype.getRequestData = function (data) {
    	var sig = data.signature;
    	var params = this.parameters;
    	if (!sig) {
	    	this.setOAuthParams();
    		sig = this.getSignature(data.secret, data.token);
    	}

    	if (!sig) {
    		throw "OAuth Error: Invalid parameters supplied to getRequestData";
    	}

    	var ret = {};
    	Object.keys(params).forEach(function (k) {
    		ret[k] = params[k];
    	});

    	ret['oauth_signature'] = sig;
    	return ret;
    };

    window.OAuthRequest = OAuthRequest;

})();