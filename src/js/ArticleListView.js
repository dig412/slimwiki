var m = require("mithril");
var ArticleList = require("./ArticleList");
var ArticleView = require("./ArticleView");

var ArticleListView = {
	oninit: function() {
		ArticleList.init();
	},
	view: function() {
		var articles = [];

		for (var id = ArticleList.list.length - 1; id >= 0; id--) {
			var article = ArticleList.list[id];
			articles.push(m(ArticleView, {article: article, key: article.id}));
		}

		return m("div", articles);
	}
};

module.exports = ArticleListView;