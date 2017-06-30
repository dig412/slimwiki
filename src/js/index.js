var m = require("mithril");
var ArticleListView = require("./ArticleListView");
var NavView = require("./NavView");

var nav = document.getElementById("sidebar");
m.mount(nav, NavView);

var articles = document.getElementById("container");
m.mount(articles, ArticleListView);
