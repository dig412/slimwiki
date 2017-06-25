var m = require("mithril");
var Nav = require("./Nav")

var Tree = {
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
					m(Tree, {tree: value, level: ++level})
				]);
			} else {
				return m("li.file", m("a", {href: value.path, onclick: Nav.handleClick.bind(Nav, null)}, value.basename));
			}
		}));
	}
};

module.exports = Tree;