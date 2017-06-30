var Article = function(id, data) {
	this.id = id;
	this.editing = false;
	if(typeof data !== 'undefined' && data !== null) {
		this.path = data.path;
		this.html = data.html;
		this.source = data.source;
	} else {
		this.path = "";
		this.html = "";
		this.source = "";
	}
};

module.exports = Article;