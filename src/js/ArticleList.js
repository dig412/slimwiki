var m = require("mithril");
var Articles = require("./Articles");
var ArticleView = require("./ArticleView");

var ArticleList = {
	oninit: function() {
		Articles.init();
	},
	view: function() {
		var articles = [];

		for (var id = Articles.list.length - 1; id >= 0; id--) {
			var article = Articles.list[id];
			articles.push(m(ArticleView, {article: article, key: article.id}));
		}

		return m("div", articles);
	}
};

module.exports = ArticleList;