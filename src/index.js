var m = require("mithril");

var Wiki = {};

Wiki.Article = function(id, data) {
	this.id = id;
	this.editing = false;
	if(typeof data !== 'undefined') {
		this.path = data.path;
		this.html = data.html;
		this.source = data.source;
	} else {
		this.path = "";
		this.html = "";
		this.source = "";
	}
};

Wiki.Nav = {};
Wiki.Nav.vm = {
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
			url: "tree",
		})
		.then(function(result) {
			Wiki.Nav.vm.list = result;
		});
	},
	search: function(query) {
		Wiki.Nav.vm.query = query;
		return m.request({
			method: "GET",
			url: "search/"+query,
		})
		.then(function(result) {
			Wiki.Nav.vm.results = result;
		});
	},
	clearResults: function() {
		Wiki.Nav.vm.results = [];
		Wiki.Nav.vm.query = "";
	},
	upload: function(e) {
		Wiki.Nav.vm.error     = null;
		Wiki.Nav.vm.uploading = true;
		var file = e.target.files[0];

		var data = new FormData();
		data.append("file", file);

		m.request({
			method: "POST",
			url: "upload",
			data: data,
		}).then(function(result) {
			Wiki.Nav.vm.load();
			Wiki.Nav.vm.uploading = false;			
		}).catch(function(e) {
			Wiki.Nav.vm.error = e.message;
			Wiki.Nav.vm.uploading = false;			
		});
	}
};

Wiki.Nav.View = {
	oninit: function() {
		Wiki.Nav.vm.init();
	},
	view: function() {
		return m("div.sidebar", [
			m("h1", "Ents24 Systems Docs"),
			m("div.form-group", [
				m("button.btn.btn-default", {onclick: Wiki.Articles.vm.new}, "New"),
				m("label.btn.btn-default", [
					Wiki.Nav.vm.uploading ? m("i.fa.fa-circle-o-notch.fa-spin") : null,
					" Upload ",
					m("i.fa.fa-upload"),
					m("input[type=file]", {onchange: Wiki.Nav.vm.upload, style:"display: none;"})
				]),
			]),
			Wiki.Nav.vm.error ? Wiki.Nav.vm.error : null,
			m("div.input-group", [
				m("input.form-control.input-sm", {placeholder: "Search", type: "text", oninput: m.withAttr("value", Wiki.Nav.vm.search), value: Wiki.Nav.vm.query}),
				m("a.input-group-addon.input-sm", {onclick:  Wiki.Nav.vm.clearResults}, m("i.fa.fa-times ")),
			]),
			Wiki.Nav.vm.results.length > 0 ? m(Wiki.Nav.Results, {results: Wiki.Nav.vm.results}): null,
			m(Wiki.Nav.Tree, {tree : Wiki.Nav.vm.list}),
		]);
	}
};

Wiki.Nav.Results = {
	view: function(vnode) {
		var results = vnode.attrs.results;
		return m("ul.search-results", results.map(function(result) {
			return m("li", m("a", {href: result, onclick: Wiki.Articles.vm.handleClick.bind(Wiki.Articles.vm, null)}, result));
		}));
	}
};

Wiki.Nav.Tree = {
	view: function(vnode) {

		var tree = vnode.attrs.tree;
		var level = vnode.attrs.level || 0;
		var keys = Object.keys(tree);

		vnode.state.subfolders = vnode.state.subfolders || {};

		return m("ul", keys.map(function(key) {
			var value = tree[key];

			if(!value.path) {
				var state = vnode.state.subfolders[key] || "close";
				var stateClass = (state === "open") ? "open" : "";
				return m("li.directory." + stateClass, [
					m("a", {"data-role": "directory", href: "#", onclick: function() {
						if(vnode.state.subfolders[key] == "open") {
							vnode.state.subfolders[key] = "close";
						} else {
							vnode.state.subfolders[key] = "open";
						}
					}}, [
						m("i.fa.fa-folder" + (stateClass ? "-"+stateClass : "")),
						" " + key
					]),
					m(Wiki.Nav.Tree, {tree: value, level: ++level})
				]);
			} else {
				return m("li.file", m("a", {href: value.path, onclick: Wiki.Articles.vm.handleClick.bind(Wiki.Articles.vm, null)}, value.basename));
			}
		}));
	}
};
Wiki.Articles = {};
Wiki.Articles.vm = {
	creatingPath: "",
	init: function() {
		Wiki.Articles.vm.list = [];
		Wiki.Articles.vm.id = 0;

		Wiki.Articles.vm.load = function(articleId, addAfter) {
			return m.request({
				method: "GET",
				url: "article/" + articleId
			}).then(function(result) {
				Wiki.Articles.vm.add(Wiki.Articles.vm.create(result), addAfter);
			}).catch(function(e) {
				if(e.status == 404) {
					Wiki.Articles.vm.creatingPath = e.path;
					Wiki.Articles.vm.new();
				}
			});
		};
		Wiki.Articles.vm.save = function(article) {
			var formData = new FormData();
			formData.append("article_path", article.path);
			formData.append("source", article.source);
			return m.request({
				method: "POST",
				url: "article",
				data: formData,
			}).then(function(response) {
				if(!response.success) {
					alert(response.message);
				} else {
					Wiki.Nav.vm.load();
				}
			});
		};
		Wiki.Articles.vm.create = function(data) {
			return new Wiki.Article(++Wiki.Articles.vm.id, data);
		};
		Wiki.Articles.vm.add = function(article, addAfterArticle) {
			if (typeof addAfterArticle == 'undefined' || addAfterArticle === null) {
				Wiki.Articles.vm.list.push(article);
			} else {
				var afterIndex = Wiki.Articles.vm.list.indexOf(addAfterArticle);
				Wiki.Articles.vm.list.splice(afterIndex, 0, article);
			}
		};
		Wiki.Articles.vm.remove = function(article) {
			var id = Wiki.Articles.vm.list.indexOf(article);
			Wiki.Articles.vm.list.splice(id, 1);
		};
		Wiki.Articles.vm.up = function(article, vnode) {
			var id = Wiki.Articles.vm.list.indexOf(article);
			var newId = id+1;

			Wiki.Articles.vm.swap(id, newId);
		};
		Wiki.Articles.vm.down = function(article, vnode) {
			var id = Wiki.Articles.vm.list.indexOf(article);
			var newId = id-1;

			Wiki.Articles.vm.swap(id, newId);
		};
		Wiki.Articles.vm.swap = function(oldId, newId) {

			if(newId < 0 || newId >= Wiki.Articles.vm.list.length) {
				return;
			}

			var a = Wiki.Articles.vm.list[oldId];
			var b = Wiki.Articles.vm.list[newId];
			Wiki.Articles.vm.list[newId] = a;
			Wiki.Articles.vm.list[oldId] = b;
			//Mark these articles as sliding, so we can apply list move animations to them
			a.sliding = true;
			b.sliding = true;
		};
		Wiki.Articles.vm.handleClick = function(article, e) {

			if (e.target.nodeName == "A") {
				//If it's a link to this site then intercept it and try and load the relevant article
				if(window.location.hostname == e.target.hostname) {

					var urlParts = e.target.href.split(".");
					var extension = urlParts[urlParts.length-1];

					if(extension == "md") {
						var relativeHref = e.target.href.split(window.location.hostname + window.location.pathname)[1];
						Wiki.Articles.vm.load(relativeHref, article);
						e.preventDefault();
					}

				}
			}
		};
		Wiki.Articles.vm.new = function() {
			var article = new Wiki.Article(++Wiki.Articles.vm.id);
			//Put the article in edit mode
			article.editing = true;
			//Prefill a path if we have one
			article.path = Wiki.Articles.vm.creatingPath;
			Wiki.Articles.vm.add(article);
		};
		Wiki.Articles.vm.edit = function(item) {
			item.editing = true;
		};
		Wiki.Articles.vm.done = function(item) {
			item.editing = false;
			Wiki.Articles.vm.creatingPath = "";
		};
		Wiki.Articles.vm.cleanup = function(article, vnode) {
			var editor = vnode.dom.editor;
			article.source = editor.value();
			article.html = editor.markdown(editor.value());
			editor.toTextArea();
			m.redraw();
			Wiki.Articles.vm.save(article);
		};

		Wiki.Articles.vm.load("index.md");
	}
};

Wiki.Articles.View = {
	oninit: function() {
		Wiki.Articles.vm.init();
	},
	view: function() {
		var articles = [];

		for (var id = Wiki.Articles.vm.list.length - 1; id >= 0; id--) {
			var article = Wiki.Articles.vm.list[id];
			articles.push(m(Wiki.ArticleView, {article: article, key: article.id}));
		}

		return m("div", articles);
	}
};

Wiki.ArticleView = {
	oninit: function(vnode) {
		vnode.state.article = vnode.attrs.article;
	},
	oncreate: function(vnode) {
		vnode.dom.classList.add("zoomIn");

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
				m("div.pull-right", [
					m("button.btn-invisible", {onclick: Wiki.Articles.vm.remove.bind(Wiki.Articles.vm, article)}, m("i.fa.fa-times")),
					m("button.btn-invisible", {onclick: Wiki.Articles.vm.up.bind(Wiki.Articles.vm, article, vnode)}, m("i.fa.fa-chevron-up")),
					m("button.btn-invisible", {onclick: Wiki.Articles.vm.down.bind(Wiki.Articles.vm, article, vnode)}, m("i.fa.fa-chevron-down")),
					!article.editing ? m("button.btn-invisible", {onclick: Wiki.Articles.vm.edit.bind(Wiki.Articles.vm, article)}, m("i.fa.fa-pencil")) : null,
					article.editing ? m("button.btn-invisible", {onclick: Wiki.Articles.vm.done.bind(Wiki.Articles.vm, article)}, m("i.fa.fa-floppy-o")) : null
				])
			]),
			!article.editing ? m("div.article-contents", { onclick: Wiki.Articles.vm.handleClick.bind(Wiki.Articles.vm, article) }, m.trust(article.html)) : null,
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
						onremove: Wiki.Articles.vm.cleanup.bind(Wiki.Articles.vm, article),
					}, article.source)
				])
			]) : null,
		]);
	}
};

var nav = document.getElementById("sidebar2");
m.mount(nav, Wiki.Nav.View);

var articles = document.getElementById("container");
m.mount(articles, Wiki.Articles.View);
