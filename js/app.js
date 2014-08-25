define( ['jquery', 'scwrapper','polytts', 'commentbox'], function ($, SC, Polytts, CommentBox) {

    var App = {
        init: function() {
            if (window.location.hash.length > 0) {
                $("#trackurl").val(decodeURIComponent(window.location.hash.replace("#","")));
            } else {
                $("#trackurl").val("https://soundcloud.com/protohype/zero-original-mix"); // default
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
            Polytts.init(CommentBox.onStart, CommentBox.onCommentEnd);
            setStatus("");

            if (window.location.hash.length > 0) {
                submitURL();
            }
        }
    };

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

    function submitURL() {
        var url = $("input:first").val();
        window.location.hash = encodeURIComponent(url);
        SC.setTrack(url, function onLoad() {
            $("#sc-widget").css('display', 'visible');
        }, function onError(error) { setStatus( error );
        }, function onCommentGet(commentCount) {
            setStatus( "Loaded " + commentCount + " comments");
        });
    }
    function setStatus(message) {
        $( "#status" ).text( message ).show();
    }

    return App;
});
