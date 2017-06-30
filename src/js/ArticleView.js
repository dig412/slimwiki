var m = require("mithril");

var ArticleView = {
	oninit: function(vnode) {
		vnode.state.article = vnode.attrs.article;
	},
	oncreate: function(vnode) {
		vnode.dom.classList.add("zoomIn");

		setTimeout(function() { 
			zenscroll.intoView(vnode.dom);
		}, 400);

		return new Promise(function(resolve) {
			setTimeout(function() {
				vnode.dom.classList.remove("zoomIn");
			}, 500);
		});
	},
	//Try to animate sliding in the list
	onupdate: function(vnode) {
		//Only try and animate vnodes we know are meant to be sliding, otherwise things end up with translate() styles
		//any time they are updated
		if(vnode.state.article.sliding) {
			var oldPos = vnode.state.oldPos;
			var newPos = vnode.dom.getBoundingClientRect();
			var deltaX = oldPos.left - newPos.left; 
			var deltaY = oldPos.top  - newPos.top;
			requestAnimationFrame( function() {
				vnode.dom.style.transform  = 'translate('+deltaX+'px, '+deltaY+'px)';
				vnode.dom.style.transition = 'transform 0s';  

				requestAnimationFrame( function() {
					vnode.dom.style.transform  = '';
					vnode.dom.style.transition = 'transform 500ms';
					vnode.state.article.sliding = false;
				});
			});
		}
	},
	//Animate on element removal:
	onbeforeremove: function(vnode) {
		vnode.dom.classList.add("zoomOut");
		//Don't resolve (remove the element from the DOM) until the animation has had some time to run
		return new Promise(function(resolve) {
			setTimeout(resolve, 350);
		});
	},
	onbeforeupdate: function(vnode, old) {
		//Stash the old position of the element so we can animate it when it moves
		if(old.dom && vnode.state.article.sliding) {
			vnode.state.oldPos = old.dom.getBoundingClientRect();
		}
	},
	view: function(vnode) {
		var article = vnode.state.article;

		return m("div.article", [
			m("div.article-controls.clearfix", [
				m("div.pull-right", 

					article.editing ? [
						m("button.btn-invisible", {onclick: ArticleVM.cancel.bind(ArticleVM, article)}, m("i.fa.fa-times-circle")),
						m("button.btn-invisible", {onclick: ArticleVM.done.bind(ArticleVM, article)}, m("i.fa.fa-floppy-o")),
					] : [
						m("button.btn-invisible", {onclick: ArticleList.remove.bind(ArticleList, article)}, m("i.fa.fa-times")),
						m("button.btn-invisible", {onclick: ArticleList.up.bind(ArticleList, article, vnode)}, m("i.fa.fa-chevron-up")),
						m("button.btn-invisible", {onclick: ArticleList.down.bind(ArticleList, article, vnode)}, m("i.fa.fa-chevron-down")),
						m("button.btn-invisible", {onclick: ArticleVM.edit.bind(ArticleVM, article)}, m("i.fa.fa-pencil")),
					]
				)
			]),
			!article.editing ? m("div.article-contents", { onclick: Nav.handleClick.bind(Nav, article) }, m.trust(article.html)) : null,
			article.editing ? m("form", [
				m("div.form-group", [
					m("label", "Article name"),
					m("input.form-control", { oninput: m.withAttr("value", function(value){article.path = value;}), value: article.path}),
				]),
				m("div.form-group", [
					m("label", "Article contents"),
					m("textarea", {
						oncreate: function(vnode) { vnode.dom.editor = new SimpleMDE({
							element: vnode.dom,
							spellChecker: false,
							toolbar: ["bold", "italic", "heading", "|", "code", "quote", "unordered-list", "table", "horizontal-rule", "|", "link", "image", "|", "preview", "guide"],
						});},
						onremove: ArticleVM.cleanup.bind(ArticleList, article),
					}, article.source)
				])
			]) : null,
		]);
	}
};

module.exports = ArticleView;
var ArticleList = require("./ArticleList");
var ArticleVM = require("./ArticleVM");
var Nav = require("./Nav");