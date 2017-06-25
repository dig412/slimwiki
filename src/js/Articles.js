var m = require("mithril");
var Article = require("./Article");

var Articles = {
	creatingPath: "",
	list: [],
	id: 0,
	init: function() {
		var articlePath = window.location.pathname.split(Config.root)[1];

		if(articlePath === "" || typeof articlePath == "undefined") {
			articlePath = "index.md";
		}

		Articles.load(articlePath);
	},
	load: function(articleId, addAfter) {

		//Workaround for a very annoying bug with the Mithril bundler. It very agressively rewrites then to then0 in
		//comments, strings and function names. This means the method call to mithril below fails.
		var thenMethod = "th" + "en";

		return m.request({
			method: "GET",
			url: Config.root + "/article/" + articleId
		})[thenMethod](function(result) {
			Articles.add(Articles.create(result), addAfter);
		}).catch(function(e) {
			if(e.status == 404) {
				Articles.creatingPath = e.path;
				Articles.new();
			}
		});
	},
	save: function(article) {
		var formData = new FormData();
		formData.append("article_path", article.path);
		formData.append("source", article.source);
		return m.request({
			method: "POST",
			url: Config.root + "/article",
			data: formData,
		}).then(function(response) {
			if(!response.success) {
				alert(response.message);
			} else {
				Nav.load();
			}
		});
	},
	create: function(data) {
		return new Article(++Articles.id, data);
	},
	add: function(article, addAfterArticle) {
		if (typeof addAfterArticle == 'undefined' || addAfterArticle === null) {
			Articles.list.push(article);
		} else {
			var afterIndex = Articles.list.indexOf(addAfterArticle);
			Articles.list.splice(afterIndex, 0, article);
		}
	},
	remove: function(article) {
		var id = Articles.list.indexOf(article);
		Articles.list.splice(id, 1);
	},
	up: function(article, vnode) {
		var id = Articles.list.indexOf(article);
		var newId = id+1;

		Articles.swap(id, newId);
	},
	down: function(article, vnode) {
		var id = Articles.list.indexOf(article);
		var newId = id-1;

		Articles.swap(id, newId);
	},
	swap: function(oldId, newId) {

		if(newId < 0 || newId >= Articles.list.length) {
			return;
		}

		var a = Articles.list[oldId];
		var b = Articles.list[newId];
		Articles.list[newId] = a;
		Articles.list[oldId] = b;
		//Mark these articles as sliding, so we can apply list move animations to them
		a.sliding = true;
		b.sliding = true;
	},
	new: function() {
		var article = new Article(++Articles.id);
		//Put the article in edit mode
		article.editing = true;
		//Prefill a path if we have one
		article.path = Articles.creatingPath;
		Articles.add(article);
	},
	edit: function(item) {
		item.editing = true;
	},
	done: function(item) {
		item.editing = false;
		Articles.creatingPath = "";
	},
	cleanup: function(article, vnode) {
		var editor = vnode.dom.editor;
		article.source = editor.value();
		article.html = editor.markdown(editor.value());
		editor.toTextArea();
		m.redraw();
		Articles.save(article);
	}
};

module.exports = Articles;