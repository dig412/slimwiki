var m = require("mithril");

var Wiki = {};
Wiki.Nav = {};
Wiki.Articles = {};
Wiki.Nav.vm = {
	list: [],
	init: function() {
		this.load();
	},
	load: function() {
		return m.request({
		    method: "GET",
		    url: "tree",
		})
		.then(function(result) {
			console.log(result);
		    Wiki.Nav.vm.list = result;
		});
	},
	handleClick: function(e) {
		e.preventDefault();
		var targetUrl = e.target.href;
		var targetHost = e.target.hostname;
		var parts = e.target.href.split(targetHost);
		var relativeUrl = parts[1];
		
		Wiki.Articles.vm.load(relativeUrl);
	}
};
Wiki.Nav.View = {
	oninit: function() {
		Wiki.Nav.vm.init();
	},
	view: function() {
		console.log(Wiki.Nav);
		return m("div.inner", [
			m("h2", m("span", "slimWiki")),
			m("div#tree-filter.input-group", [
				m("input#tree-filter-query.form-control.input-sm", {placeholder: "Search", type: "text"}),
				m("a#tree-filter-clear-query.input-group-addon.input-sm", m("i.glyphicon.glyphicon-remove")),
			]),
			m("ul#tree", Wiki.Nav.vm.list.map(function(entry) {
				return m("li.file", m("a", {href: entry.path, onclick: Wiki.Nav.vm.handleClick}, entry.path));
			}))
		]);
	}
};

var nav = document.getElementById("sidebar");
m.mount(nav, Wiki.Nav.View);