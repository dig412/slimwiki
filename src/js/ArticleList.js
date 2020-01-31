var m = require("mithril");

var ArticleList = {
	list: [],
	init: function() {
		var articlesString = window.location.hash.replace("#!", "");

		if(articlesString.length > 0) {
			var articles = articlesString.split(",");
		} else {
			var articles = ["index.md"];
		}

		for(articlePath of articles) {
			ArticleList.load(articlePath);
		}
	},
	load: function(articleId, addAfter) {
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
		window.location.hash = "#!" + ArticleList.list.map(a => a.path).join(",");
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
