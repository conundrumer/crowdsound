define( ['scwrapper','polytts'], function (SC, Polytts) {

	var App = {
		init: function() {
			SC.init();
			Polytts.init();
			SC.setTrack('https://soundcloud.com/skrillex/coast-is-clear-feat-chance-the', playTrack);
		}
	};

	function playTrack() {
		SC.play(function(comment) {
            if (typeof(comment) !== 'string') return;
            if (/http:\/\/|https:\/\//.test(comment)) return; //don't speak urls
			console.log(comment);
			Polytts.speak(comment);
		});
	}

	return App;
});