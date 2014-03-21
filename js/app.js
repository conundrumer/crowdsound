define( ['scwrapper','polytts'], function (SC, Polytts) {

	var App = {
		init: function() {
		SC.init();
		Polytts.init();
		Polytts.hello();
		}
	};

	return App;
});