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
            // window.startTestComment();
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
        "<div class='c minimized' id= '<%= id %>' style='font-size:<%= size %>px;'><%= body %></div>");

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

    // var animationOptions = { opacity: 'toggle','height': 'toggle','line-height': 'toggle', 'padding-bottom': 'toggle', 'padding-top': 'toggle',
    //         'margin-top': 'toggle', 'margin-bottom': 'toggle'};

    function onCommentStart(comment) {
        comment.size = Math.round(40*Math.pow(comment.body.length, -0.3)) + 8;
        // console.log(comment.size);
        $("#comments").prepend(commentTemplate(comment));
        if (comment.size < 25) {
            $("#comments #" + comment.id).addClass('multiline');
        }
        // $("#comments #" + comment.id).animate(animationOptions, 0).animate(animationOptions, 50);
        setTimeout(function(){$("#comments #" + comment.id).removeClass('minimized')}, 20);
    }

    function onCommentEnd(comment) {
        $("#comments #" + comment.id).addClass('minimized');
        $("#comments #" + comment.id).one('transitionend', function(e) {
            $("#comments #" + comment.id).remove();
        });
        // setTimeout(function(){$("#comments #" + comment.id).remove()}, 100);
        // $("#comments #" + comment.id).animate(animationOptions, 50, function () {
        //     $("#comments #" + comment.id).remove();
        // });
    }

    function setStatus(message) {
        $( "#status" ).text( message ).show();
    }

    /* TEST CODE */
    var testCommentRunning = false,
        minDuration = 500,
        maxDuration = 5000,
        minDelay = 0,
        maxDelay = 1000,
        testID = 0;
    function getTestComment() {
        switch (Math.floor(Math.random()*8)){
            case 0:
            case 1:
            case 2:
            case 3:
                return "hello world "
            case 4:
            case 5:
                return "hello world\nfoobar gierjaiej"
            case 6:
                return "asdf\nqwerty\nnoriert ierjg iaerjgoiaerjgoi aejorje ojoigj  rigjaeroigjera iojareoij gaoeirjgaoierjioj "
            case 7:
                /* falls through */
            default:
                return "asdf\nretqt\nerqg\nwooooooooo 23rop k23rpok23 pok32 rpokboerjboierjb;oi ejro;i aga reigjaeoirjg oiaejrgoiaejr o;aejrgoi aejrgo;iajergiojaero;igj aeo;jga"
        }
    }
    function testComment() {
        if (!testCommentRunning) return;
        var duration = (maxDuration - minDuration)*Math.pow(Math.random(), 2) + minDuration;
        var delay = (maxDelay - minDelay)*Math.random() + minDelay;
        var comment = {
            body: getTestComment()+Math.floor(Math.random()*8),
            id: testID++
        };
        onCommentStart(comment);
        setTimeout(function() {
            onCommentEnd(comment);
        }, duration);
        setTimeout(testComment, delay);
    }
    window.startTestComment = function() {
        testCommentRunning = true;
        testComment();
    }
    window.stopTestComment = function() {
        testCommentRunning = false;
    }
    return App;
});
