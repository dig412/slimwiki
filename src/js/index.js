var m = require("mithril");
var ArticleList = require("./ArticleList");
var NavView = require("./NavView");

var nav = document.getElementById("sidebar");
m.mount(nav, NavView);

var articles = document.getElementById("container");
m.mount(articles, ArticleList);
