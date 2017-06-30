var m = require("mithril");

var ArticleList = {
	list: [],
	init: function() {
		var articlePath = window.location.pathname.split(Config.root)[1];

		if(articlePath === "" || articlePath === "/" || typeof articlePath == "undefined") {
			articlePath = "index.md";
		}

		ArticleList.load(articlePath);
	},
	load: function(articleId, addAfter) {

		//Workaround for a very annoying bug with the Mithril bundler. It very agressively rewrites then to then0 in
		//comments, strings and function names. This means the method call to mithril below fails.
		var thenMethod = "th" + "en";

		return m.request({
			method: "GET",
			url: Config.root + "/article/" + articleId
		}).then(function(result) {
			ArticleList.add(ArticleVM.create(result), addAfter);
		}).catch(function(e) {
			if(e.status == 404) {
				ArticleList.add(ArticleVM.create(null, true, e.path), addAfter);
			}
		});
	},
	new: function() {
		ArticleList.add(ArticleVM.create(null, true));
	},
	add: function(article, addAfterArticle) {
		if (typeof addAfterArticle == 'undefined' || addAfterArticle === null) {
			ArticleList.list.push(article);
		} else {
			var afterIndex = ArticleList.list.indexOf(addAfterArticle);
			ArticleList.list.splice(afterIndex, 0, article);
		}
	},
	remove: function(article) {
		var id = ArticleList.list.indexOf(article);
		ArticleList.list.splice(id, 1);
	},
	up: function(article, vnode) {
		var id = ArticleList.list.indexOf(article);
		var newId = id+1;

		ArticleList.swap(id, newId);
	},
	down: function(article, vnode) {
		var id = ArticleList.list.indexOf(article);
		var newId = id-1;

		ArticleList.swap(id, newId);
	},
	swap: function(oldId, newId) {

		if(newId < 0 || newId >= ArticleList.list.length) {
			return;
		}

		var a = ArticleList.list[oldId];
		var b = ArticleList.list[newId];
		ArticleList.list[newId] = a;
		ArticleList.list[oldId] = b;
		//Mark these articles as sliding, so we can apply list move animations to them
		a.sliding = true;
		b.sliding = true;
	}
};

module.exports = ArticleList;
var Article = require("./Article");
var ArticleVM = require("./ArticleVM");
