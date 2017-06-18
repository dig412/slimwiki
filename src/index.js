var m = require("mithril");

var Wiki = {};

Wiki.Article = function(id, data) {
	this.id = id;
	this.editing = false;
	if(typeof data !== 'undefined') {
		this.path = data.path;
		this.html = data.html
		this.source = data.source;
	} else {
		this.path = "";
		this.html = "";
		this.source = "";
	}
}

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
	},
	// handleClick: function(e) {
	// 	e.preventDefault();
	// 	var targetUrl = e.target.href;
	// 	var targetHost = e.target.hostname;
	// 	var parts = e.target.href.split(targetHost);
	// 	var relativeUrl = parts[1];
		
	// 	Wiki.Articles.vm.load(relativeUrl);
	// }
};
Wiki.Nav.View = {
	oninit: function() {
		Wiki.Nav.vm.init();
	},
	view: function() {
		return m("div.inner", [
			m("h2", m("span", "slimWiki")),
			m("button.btn.btn-black", {onclick: function(){Wiki.Articles.vm.creating = true}}, "New"),
			m("div#tree-filter.input-group", [
				m("input#tree-filter-query.form-control.input-sm", {placeholder: "Search", type: "text"}),
				m("a#tree-filter-clear-query.input-group-addon.input-sm", m("i.glyphicon.glyphicon-remove")),
			]),
			// m("ul#tree", Wiki.Nav.vm.list.map(function(entry) {
			// 	return m("li.file", m("a", {href: entry.path, onclick: Wiki.Nav.vm.handleClick}, entry.path));
			// }))
			m(Wiki.Nav.Tree, {tree : Wiki.Nav.vm.list})
		]);
	}
};
Wiki.Nav.Tree = {
	view: function(vnode) {

		var tree = vnode.attrs.tree;
		var level = vnode.attrs.level || 0;
		var keys = Object.keys(tree);
		var id = (level == 0) ? "#tree" : "";

		vnode.state.subfolders = vnode.state.subfolders || {};

		return m("ul" + id, keys.map(function(key) {
			var value = tree[key];

			if(!value.path) {
				var state = vnode.state.subfolders[key] || "close"
				var stateClass = (state === "open") ? "open" : "";
				return m("li.directory." + stateClass, [
					m("a", {"data-role": "directory", href: "#", onclick: function() {
						if(vnode.state.subfolders[key] == "open") {
							vnode.state.subfolders[key] = "close";
						} else {
							vnode.state.subfolders[key] = "open";
						}
					}}, [
						m("i.glyphicon.glyphicon-folder-" + state),
						" " + key
					]),
					m(Wiki.Nav.Tree, {tree: value, level: ++level})
				]);
			} else {
				return m("li", m("a", {href: value.path, onclick: Wiki.Articles.vm.handleClick.bind(Wiki.Articles.vm, null)}, value.basename));
			}
		}));
	}
};
Wiki.Articles = {};
Wiki.Articles.vm = {
	creating: false,
	created: {},
	init: function() {
	    Wiki.Articles.vm.list = new Array;
	    Wiki.Articles.vm.id = 0;

	    Wiki.Articles.vm.load = function(articleId, addAfter) {
	        return m.request({
	            method: "GET",
	            url: "article/" + articleId
	        }).then(function(result) {
	            Wiki.Articles.vm.add(result, addAfter);
	        });
	    }
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
	        	}
	        }).catch(function(e) {
	            alert(e.message);
	        });
	    }
	    Wiki.Articles.vm.add = function(data, addAfterArticle) {
	        Wiki.Articles.vm.id++;

	        if (typeof addAfterArticle == 'undefined' || addAfterArticle == null) {
	            Wiki.Articles.vm.list.push(new Wiki.Article(Wiki.Articles.vm.id, data));
	        } else {
	            var afterIndex = Wiki.Articles.vm.list.indexOf(addAfterArticle);
	            Wiki.Articles.vm.list.splice(afterIndex, 0, new Wiki.Article(Wiki.Articles.vm.id, data));
	        }
	    }
	    Wiki.Articles.vm.remove = function(article) {
	        var id = Wiki.Articles.vm.list.indexOf(article);
	        Wiki.Articles.vm.list.splice(id, 1);
	    }
	    Wiki.Articles.vm.up = function(article) {
	        var id = Wiki.Articles.vm.list.indexOf(article);
	        var newId = id+1;

	        //Already at the top
	        if(newId >= Wiki.Articles.vm.list.length) {
	            return;
	        }

	        var temp = Wiki.Articles.vm.list[newId];
	        Wiki.Articles.vm.list[newId] = Wiki.Articles.vm.list[id];
	        Wiki.Articles.vm.list[id] = temp;
	    }
	    Wiki.Articles.vm.down = function(article) {
	        var id = Wiki.Articles.vm.list.indexOf(article);
	        var newId = id-1;

	        //Already at the bottom
	        if(newId < 0) {
	            return;
	        }

	        var temp = Wiki.Articles.vm.list[newId];
	        Wiki.Articles.vm.list[newId] = Wiki.Articles.vm.list[id];
	        Wiki.Articles.vm.list[id] = temp;
	    }
	    Wiki.Articles.vm.handleClick = function(article, e) {
	        if (e.target.nodeName == "A") {
	            var relativeHref = e.target.href.split(e.target.hostname + "/")[1];
	            Wiki.Articles.vm.load(relativeHref, article);
	            e.preventDefault();
	        } else {
	        	console.log("NOEP");
	            e.preventDefault();
	        }
	    }
	    Wiki.Articles.vm.edit = function(item) {
	        item.editing = true;
	    }
	    Wiki.Articles.vm.done = function(item) {
	        item.editing = false;
	        Wiki.Articles.vm.creating = false;
	    }
	    Wiki.Articles.vm.cleanup = function(article, vnode) {
	        var editor = vnode.dom.editor;
	        article.source = editor.value();
	        article.html = editor.markdown(editor.value());
	        editor.toTextArea();
	        m.redraw();
	        Wiki.Articles.vm.save(article);
	    }

	    Wiki.Articles.vm.load("live/a.md");
	    Wiki.Articles.vm.load("live/b.md");
	    Wiki.Articles.vm.load("live/c.md");
	    Wiki.Articles.vm.load("live/new.md");
	}
}
Wiki.Articles.View = {
	oninit: function() {
		Wiki.Articles.vm.init();
	},
	view: function() {
		var articles = [];

		if(Wiki.Articles.vm.creating) {
			articles.push(m(Wiki.NewArticleView));
		}

		for (var id = Wiki.Articles.vm.list.length - 1; id >= 0; id--) {
			var article = Wiki.Articles.vm.list[id]
			articles.push(m(Wiki.ArticleView, {article: article, key: article.id}));
		}

		return m("div.inner", [
			m("div", articles)
		]);
	}
}

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
		})
	},
	//Try to animate sliding in the list
	onupdate: function(vnode) {
		const oldPos = vnode.state.oldPos;
		const newPos = vnode.dom.getBoundingClientRect();
		const deltaX = oldPos.left - newPos.left; 
		const deltaY = oldPos.top  - newPos.top;
		requestAnimationFrame( function() {
		      vnode.dom.style.transform  = `translate(${deltaX}px, ${deltaY}px)`;
		      vnode.dom.style.transition = 'transform 0s';  
		      
		      requestAnimationFrame( function() {
		        vnode.dom.style.transform  = '';
		        vnode.dom.style.transition = 'transform 500ms';
		      });
		});
	},
	//Animate on element removal:
	onbeforeremove: function(vnode) {
		vnode.dom.classList.add("zoomOut");
		return new Promise(function(resolve) {
			setTimeout(resolve, 350)
		})
	},
	onbeforeupdate: function(vnode, old) {
		//Stash the old position of the element so we can
		if(old.dom) {
			vnode.state.oldPos = old.dom.getBoundingClientRect();
		}
	},
	view: function(vnode) {
		var article = vnode.state.article;

		if(article.editing) {console.log(article);}

		return m("div.article", [
			m("div.article-controls.clearfix", [
				m("div.pull-right", [
					m("button.btn-invisible", {onclick: Wiki.Articles.vm.remove.bind(Wiki.Articles.vm, article)}, m("i.glyphicon.glyphicon-remove")),
					m("button.btn-invisible", {onclick: Wiki.Articles.vm.up.bind(Wiki.Articles.vm, article)}, m("i.glyphicon.glyphicon-chevron-up")),
					m("button.btn-invisible", {onclick: Wiki.Articles.vm.down.bind(Wiki.Articles.vm, article)}, m("i.glyphicon.glyphicon-chevron-down")),
					!article.editing ? m("button.btn-invisible", {onclick: Wiki.Articles.vm.edit.bind(Wiki.Articles.vm, article)}, m("i.glyphicon.glyphicon-pencil")) : null,
					article.editing ? m("button.btn-invisible", {onclick: Wiki.Articles.vm.done.bind(Wiki.Articles.vm, article)}, m("i.glyphicon.glyphicon-ok")) : null
				])
			]),
			!article.editing ? m("div.article-contents", { onclick: Wiki.Articles.vm.handleClick.bind(Wiki.Articles.vm, article) }, m.trust(article.html)) : null,
			article.editing ? m("form", [
				m("div.form-group", [
					m("label", "Article name"),
					m("input.form-control", { oninput: m.withAttr("value", function(value){article.path = value}), value: article.path}),
				]),
				m("div.form-group", [
					m("label", "Article contents"),
					m("textarea", {
						oncreate: function(vnode) { vnode.dom.editor = new SimpleMDE({ element: vnode.dom}); },
						onremove: Wiki.Articles.vm.cleanup.bind(Wiki.Articles.vm, article),
					}, article.source)
				])
			]) : null,
		]);
	}
};

Wiki.NewArticleView = {
	oninit: function(vnode) {
		vnode.state.article = new Wiki.Article(++Wiki.Articles.vm.id);
		vnode.state.article.editing = true;
	},
	view: function(vnode) {
		return m(Wiki.ArticleView, {article: vnode.state.article});
	}
};

var nav = document.getElementById("sidebar");
m.mount(nav, Wiki.Nav.View);

var articles = document.getElementById("container");
m.mount(articles, Wiki.Articles.View);
