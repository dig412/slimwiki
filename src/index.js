var m = require("mithril");

var Wiki = {};
Wiki.Nav = {};
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
	}
};
Wiki.Nav.View = {
	oninit: function() {
		Wiki.Nav.vm.init();
	},
	view: function() {
		console.log(Wiki.Nav);
		return m("ul#tree", Wiki.Nav.vm.list.map(function(entry) {
			return m("li.file", m("a", {href: entry.path}, entry.path));
		}));
	}
};

var nav = document.getElementById("sidebar");
m.mount(nav, Wiki.Nav.View);