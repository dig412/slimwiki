var m = require("mithril");
var Nav = require("./Nav");
var Tree = require("./Tree");
var SearchResults = require("./SearchResults");
var ArticleList = require("./ArticleList");

var NavView = {
	oninit: function() {
		Nav.init();
	},
	view: function() {
		return m("div.sidebar", [

			m("h1", Config.siteName),
			m("ul.tabs", [
				m("li"+(Nav.state=="articles" ? ".active" : ""), m("a", {onclick: function() {Nav.state = "articles";}}, "Articles")),
				m("li"+(Nav.state=="uploads" ? ".active" : ""), m("a", {onclick: function() {Nav.state = "uploads";}}, "Uploads"))
			]),

			Nav.state == "articles" ? [
				m("div.form-group", [
					m("button.btn.btn-default", {onclick: ArticleList.new}, "New"),
				]),
				Nav.error ? Nav.error : null,
				m("div.input-group", [
					m("input.form-control.input-sm", {placeholder: "Search", type: "text", oninput: function(ev){Nav.search(ev.target.value)}, value: Nav.query}),
					m("a.input-group-addon.input-sm", {onclick:  Nav.clearResults}, m("i.fa.fa-times ")),
				]),
				Nav.results.length > 0 ? m(SearchResults, {results: Nav.results}): null,
				m(Tree, {tree : Nav.list}),
			] : [
				m("div.form-group", [
					m("label.btn.btn-default", [
						Nav.uploading ? m("i.fa.fa-circle-o-notch.fa-spin") : null,
						" Upload ",
						m("i.fa.fa-upload"),
						m("input[type=file]", {onchange: Nav.upload, style:"display: none;"})
					]),
				]),
				m(Tree, {tree : Nav.uploads}),
			]
		]);
	}
};

module.exports = NavView;