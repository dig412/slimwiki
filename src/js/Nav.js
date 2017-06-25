var m = require("mithril");
var Articles = require("./Articles");

var Nav = {
	list: [],
	results: [],
	query: "",
	uploading: false,
	error: "",
	init: function() {
		this.load();
	},
	load: function() {
		return m.request({
			method: "GET",
			url: Config.root + "/tree",
		})
		.then(function(result) {
			Nav.list = result;
		});
	},
	search: function(query) {
		Nav.query = query;
		return m.request({
			method: "GET",
			url: Config.root + "/search/"+query,
		})
		.then(function(result) {
			Nav.results = result;
		});
	},
	clearResults: function() {
		Nav.results = [];
		Nav.query = "";
	},
	upload: function(e) {
		Nav.error     = null;
		Nav.uploading = true;
		var file = e.target.files[0];

		var data = new FormData();
		data.append("file", file);

		m.request({
			method: "POST",
			url: Config.root + "/upload",
			data: data,
		}).then(function(result) {
			Nav.load();
			Nav.uploading = false;			
		}).catch(function(e) {
			Nav.error = e.message;
			Nav.uploading = false;			
		});
	},
	handleClick: function(article, e) {

		if (e.target.nodeName == "A") {
			//If it's a link to this site then intercept it and try and load the relevant article
			if(window.location.hostname == e.target.hostname) {

				var urlParts = e.target.href.split(".");
				var extension = urlParts[urlParts.length-1];

				if(extension == "md") {
					var relativeHref = e.target.href.split(window.location.hostname + window.location.pathname)[1];
					Articles.load(relativeHref, article);
					e.preventDefault();
				}

			}
		}
	}
};


module.exports = Nav;