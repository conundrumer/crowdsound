define( ['jquery', 'underscore', 'scwrapper','polytts'], function ($, _, SC, Polytts) {

	var App = {
		init: function() {
			if (window.location.hash.length > 0) {
				$("#trackurl").val(decodeURIComponent(window.location.hash.replace("#","")));
			} else {
				$("#trackurl").val("https://soundcloud.com/herobust/sheknowshebad"); // default
			}
			$("#go").removeAttr('onclick'); // what is this hack
			$("form").submit(function(event) {
				event.preventDefault();
				var url = $("input:first").val();
				window.location.hash = encodeURIComponent(url);
				setStatus( "Loading..." );
				SC.setTrack(url, function onLoad() {
					SC.play(timedComment,
						function onPlay(trackName) { setStatus( "Now playing " + trackName + "..." ); },
						function onStop() { setStatus(""); }
						);
				}, function onError(error) { setStatus( error ); });
			});
			$("#stopbutton").click(function() {
				SC.stop();
			});

			SC.init();
			Polytts.init(onCommentStart, onCommentEnd);

		}
	};

	var commentid = 0;
	var commentTemplate = _.template("<p class='c' id= '<%= id %>' ><%= text %></p>");

	function invalidComment(comment) {
		return typeof(comment) !== 'string' ||
		comment === "" || // don't speak silence
		/http:\/\/|https:\/\/|.com|[^\x00-\x7F]/.test(comment); //don't speak urls or non-ascii
	}

	function formatComment(comment) {
		return (" " + comment).replace(/!+/g, "!")
		.replace(/<3+/g, " heart ")
		.replace(/\s#\w/g, "hashtag ")
		.replace(/:D|:\)|\(:|C:|c:|:>|<:/g, " happy face ")
		.replace(/:O|O:|:o|o:/g, " surprised face ")
		.replace(/;D|;\)|\(;/g, " winky face ")
		.replace(/D:|\):|:\(|:C|:c|>:|:</g, " sad face ")
		.toLowerCase();
	}

	function timedComment(comment) {
        if (invalidComment(comment)) return;
		var currentid = commentid;
		commentid++;// console.log(formatComment(comment));
		Polytts.speak(formatComment(comment), comment, currentid);
	}

	function onCommentStart(comment, id) {
		$("#comments").prepend(commentTemplate({ text: comment, id: id }));
	}

	function onCommentEnd(id) {
		$("#comments #" + id).remove();
	}

	function setStatus(message) {
		$( "#status" ).text( message ).show();
	}

	return App;
});