define( ['scwrapper','polytts'], function (SC, Polytts) {

	var App = {
		init: function() {
			SC.init();
			Polytts.init();
			Polytts.hello();
			SC.setTrack('https://soundcloud.com/herobust/sheknowshebad', function() {
				console.log(SC.comments.length);
				console.log(SC.comments[0]);
			});
		}
	};

	return App;
});