(function (app) {
	"use strict";
	var LS_KEY = 'tester_histories';
	var _requests = {};
	var el;
	var template = $("#histories-template").html();

	function pad(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function render() {
		var data = Object.keys(_requests).sort().reverse().map(function (k) {
			var i = _requests[k];
			return {
				name: i.name,
				id: i.id
			};
		});
		var html = Mustache.render(template, { histories: data });
		el.find("ul").html(html);
	}

	function update() {
		localStorage.setItem(LS_KEY, JSON.stringify(_requests));
		render();
	}
	
	function bind() {
		el.on('click', 'ul li a', function (ev) {
			var li = $(ev.currentTarget).closest("[data-hist]"),
				id = li.data("hist"),
				lnk = $(this);
			if (lnk.is(".main")) {
				var item = _requests[id];
				app.form.fillValues(item.data);
			}
			else if (lnk.is(".remove")) {
				delete _requests[id];
				update();
			}
			else if (lnk.is(".js-edit")) {
				log(li);
				li.addClass("editing");
			}
		});
		el.on('click', 'ul li .js-save-name', function (ev) {
			var li = $(ev.currentTarget).closest("[data-hist]"),
				id = li.data("hist");
			_requests[id].name = li.find(".js-hist-name").val();
			update();
		});
		el.on('click', '.clear-hist', function (ev) {
			_requests = {};
			localStorage.removeItem(LS_KEY);
			el.find("ul").html("");
		});
	}

	app.history = {};
	app.history.init = function () {
		el = $("#histories");
		var lsVal = localStorage.getItem(LS_KEY) || "{}";
		_requests = JSON.parse(lsVal);
		render();
		bind();
	};
	app.history.add = function (h) {
		delete h['secret'];
		var now = new Date();
		var id = now.getTime();
		var hour = now.getHours();
		var name = (now.getMonth() + 1) + "/" + (now.getDate()) + "/" + (now.getUTCFullYear()) + " - " 
					+ (hour % 12) + ":" + (pad(now.getMinutes(), 2)) + (hour > 12 ? "PM" : "AM");

		var hist = {
			id: id,
			name: name,
			data: h,
			date: name
		};
		_requests[id] = hist;
		update();
	};

})(app);