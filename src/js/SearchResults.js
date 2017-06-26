var m = require("mithril");
var Nav = require("./Nav");

var SearchResults = {
	view: function(vnode) {
		var results = vnode.attrs.results;
		return m("ul.search-results", results.map(function(result) {
			return m("li", m("a", {href: result, onclick: Nav.handleClick.bind(Nav, null)}, result));
		}));
	}
};

module.exports = SearchResults;