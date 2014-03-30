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
                submitURL();
            });
            $("#stopbutton").click(function() {
                Polytts.stop();
                $("#comments").empty();
            });
            setStatus("Loading SoundCloud...");
            SC.init("sc-widget", timedComment, Polytts.clear,
                Polytts.setActive, Polytts.setUnactive);
            setStatus("Loading Text to Speech...");
            Polytts.init(onCommentStart, onCommentEnd);
            setStatus("");

            if (window.location.hash.length > 0) {
                submitURL();
            }
        }
    };

    function submitURL() {
        var url = $("input:first").val();
        window.location.hash = encodeURIComponent(url);
        setStatus( "Loading..." );
        SC.setTrack(url, function onLoad() {
            $("#sc-widget").css('display', 'visible');
        }, function onError(error) { setStatus( error ); });
    }

    var commentTemplate = _.template("<p class='c' id= '<%= id %>' ><%= body %></p>");

    function invalidComment(comment) {
        return typeof(comment) !== 'string' ||
        comment === "" || // don't speak silence
        // don't speak URLs or non-ascii or replies (ie "@username: ")
        /http:\/\/|https:\/\/|.com|[^\x00-\x7F]|^@.+:\s/.test(comment);

    }

    function formatComment(comment) {
        return (" " + comment).replace(/!+/g, "!")
        .replace(/<3+/g, " heart ")
        .replace(/\s#\w/g, "hashtag ")
        .replace(/:D|:\)|\(:|C:|c:|:>|<:/g, " happy face ")
        .replace(/:O|O:|:o|o:/g, " surprised face ")
        .replace(/;D|;\)|\(;/g, " winky face ")
        .replace(/D:|\):|:\(|:C|:c|>:|:</g, " sad face ")
        .replace(/bass+/g, "base")
        .toLowerCase();
    }

    function timedComment(comment, delay) {
        if (invalidComment(comment.body)) return;
        Polytts.speak({text: formatComment(comment.body), comment: comment, delay: delay});
    }

    function onCommentStart(comment) {
        $("#comments").prepend(commentTemplate(comment));
    }

    function onCommentEnd(comment) {
        $("#comments #" + comment.id).remove();
    }

    function setStatus(message) {
        $( "#status" ).text( message ).show();
    }

    return App;
});