var m = require("mithril");

var ArticleVM = {
	id: 0,
	create: function(data, editing, path) {
		var article = new Article(++ArticleVM.id, data);
		//Put the article in edit mode if requested
		article.editing = editing;
		//Prefill a path if we have one
		if(typeof path !== "undefined" && path !== null) {
			article.path = path;
		}
		return article;
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
	edit: function(item) {
		item.editing = true;
	},
	done: function(article) {
		article.editing = false;
		article.shouldSave = true;
	},
	cancel: function(article) {
		article.editing = false;
		article.shouldSave = false;
	},
	cleanup: function(article, vnode) {
		var editor = vnode.dom.editor;

		if(article.shouldSave) {
			article.source = editor.value();
			article.html = editor.markdown(editor.value());
		}

		editor.toTextArea();
		m.redraw();

		if(article.shouldSave) {
			ArticleVM.save(article);
		}

		article.shouldSave = false;
	}
};

module.exports = ArticleVM;
var Article = require("./Article");
var Nav = require("./Nav");