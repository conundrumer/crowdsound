define( ['jquery', 'underscore', 'scwrapper','polytts'], function ($, _, SC, Polytts) {

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
        SC.setTrack(url, function onLoad() {
            $("#sc-widget").css('display', 'visible');
        }, function onError(error) { setStatus( error );
        }, function onCommentGet(commentCount) {
            setStatus( "Loaded " + commentCount + " comments");
        });
    }

    var commentTemplate = _.template(
        "<div class='c' id= '<%= id %>' style='font-size:<%= size %>px;'><%= body %></div>");

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

    var animationOptions = { opacity: 'toggle','height': 'toggle','line-height': 'toggle', 'padding-bottom': 'toggle', 'padding-top': 'toggle',
            'margin-top': 'toggle', 'margin-bottom': 'toggle'};

    function onCommentStart(comment) {
        comment.size = Math.round(40*Math.pow(comment.body.length, -0.3)) + 8;
        // console.log(comment.size);
        $("#comments").prepend(commentTemplate(comment));
        $("#comments #" + comment.id).animate(animationOptions, 0).animate(animationOptions, 50);
    }

    function onCommentEnd(comment) {
        $("#comments #" + comment.id).animate(animationOptions, 50, function () {
            $("#comments #" + comment.id).remove();
        });
    }

    function setStatus(message) {
        $( "#status" ).text( message ).show();
    }

    return App;
});
