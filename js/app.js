define( ['jquery', 'scwrapper','polytts'], function ($, SC, Polytts) {

	var App = {
		init: function() {
			SC.init();
			Polytts.init();
			$("form").submit(function(event) {
				event.preventDefault();
				var url = $("input:first").val();
				setMessage( "Loading..." );
				SC.setTrack(url, onLoad, onError);
			});
			$("#stopbutton").click(function() {
				SC.stop();
			});
		}
	};

	function setMessage(message) {
		$( "span" ).text( message ).show();
	}

	function onLoad() {
		SC.play(timedComment, onPlay, onStop);
	}

	function onPlay() {
		setMessage( "Playing..." );
	}

	function onStop() {
		setMessage("");
	}

	function onError(message) {
		setMessage( message );
	}

	function timedComment(comment) {
        if (typeof(comment) !== 'string') return;
        if (/http:\/\/|https:\/\//.test(comment)) return; //don't speak urls
        if (comment === "") return; // don't speak silence
		console.log(comment);
		Polytts.speak(comment);
	}

	return App;
});