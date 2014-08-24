/**
 * SoundCloud SDK wrapper
 */
define( ['soundcloud', 'sc-widget', 'timedcomments'], function (SC, SCwidget, TimedComments) {
    var Widget = SCwidget.Widget;

    var MY_CLIENT_ID = 'f4352d8c413a0a2ab164d974da1c9083',
    PAGE_SIZE = 200,
    MAX_OFFSET = 8000,
    TRACK_VOLUME = 0.25, // 25% of initial volume
    init_volume = 1, // because sc-widget is wrong sometimes, the worst kind of wrong :|
    LOOKAHEAD = 2000, // lookahead: ms
    widget = null;

    function loadoptions (onload) {
        return {
            callback: function () {
                // widget.setVolume(TRACK_VOLUME);
                onload();
            }
        };
    }

    var SCwrapper = {
        trackID: null,

        init: function (widgetID, onComment, onSeek, onPlay, onPause) {
            this.comments = null;
            var self = this;
            widget = Widget(widgetID);
            // widget.setVolume(TRACK_VOLUME);
            widget.bind(Widget.Events.PLAY, function() {
                widget.getVolume(function(volume){
                    if (volume === 1 || volume === 100) {
                        init_volume = volume;
                    }
                    widget.setVolume(init_volume * TRACK_VOLUME);
                    onPlay();
                });
            });
            widget.bind(Widget.Events.SEEK, function(e) {
                self.comments.skipped = true;
                onSeek();
            });
            widget.bind(Widget.Events.PLAY_PROGRESS, function(e) {
                // widget.setVolume(init_volume * TRACK_VOLUME);
                self.comments.advance(e.currentPosition, LOOKAHEAD, onComment);
            });
            widget.bind(Widget.Events.PAUSE, function() {
                self.comments.skipped = true;
                onPause();
            });
            SC.initialize({
                client_id: MY_CLIENT_ID
            });
        },

        setTrack: function (trackUrl, onload, onerror, oncommentget) {
            widget.pause();
            onload = onload || function() {};
            var self = this;
            SC.get('/resolve', { url: trackUrl },
                function (trackData, error) {
                    if (error) {
                        onerror(error.message);
                        widget.load(null);
                        onload();
                        return;
                    }
                    if (self.trackID === trackData.id) {
                        return;
                    }
                    self.trackID = trackData.id;
                    widget.load(trackData.uri, loadoptions(onload));
                    self.loadComments(trackData, oncommentget);
                });
        },
        loadComments: function(trackData, oncommentget) {
            oncommentget(0);
            this.comments = new TimedComments();
            var self = this;
            var commentCount = Math.min(trackData.comment_count, MAX_OFFSET);
            function onCommentGet (comments) {
                self.comments.addComments(comments);
                oncommentget(self.comments.comments.length);
            }
            for (var offset = 0; offset < commentCount; offset += PAGE_SIZE) {
                SC.get('/tracks/' + trackData.id + '/comments',
                    { limit: PAGE_SIZE, offset: offset}, onCommentGet);
            }
        }
    };

    return SCwrapper;
});
