/**
 * SoundCloud SDK wrapper
 */
define( ['soundcloud'], function (SC) {

    var MY_CLIENT_ID = 'f4352d8c413a0a2ab164d974da1c9083',
    PAGE_SIZE = 200,
    MAX_OFFSET = 8000;

	var SCwrapper = {
        sound: null,
        trackID: null,
        trackUrl: null,

        init: function () {
            SC.initialize({
                client_id: MY_CLIENT_ID
            });
        },

        setTrack: function (trackUrl, onload, onerror) {
            this.stop();
            onload = onload || function() {};
            if (this.trackUrl === trackUrl) {
                onload();
                return;
            }
            this.trackUrl = trackUrl;
            // this.comments = []; // reset comments
            var self = this;
            SC.get('/resolve', { url: trackUrl },
                function (trackData, error) {
                    if (error) {
                        onerror(error.message);
                        return;
                    }
                    self.trackID = trackData.id;
                    onload();
                    // self.setComments(0, onload);
                });
        },
/*
        setComments: function (offset, callback) {
            var self = this;
            SC.get('/tracks/' + self.trackID + '/comments',
                { limit: PAGE_SIZE, offset: offset},
                function (comments) {
                    self.comments = self.comments.concat(self.formatComments(comments));
                    if (comments.length === PAGE_SIZE && offset < MAX_OFFSET) {
                        self.setComments(offset + PAGE_SIZE, callback);
                    } else {
                        callback();
                    }
                });
        },

        formatComments: function (comments) {
            return comments.map(function (comment) {
                return {
                    body: comment.body,
                    timestamp: comment.timestamp,
                    user: comment.user.username
                };
            }).filter(function (comment) {
                return comment.timestamp !== null;
            });
        },
*/
        play: function(commentCallback, playCallback, stopCallback) {
            SC.stream('/tracks/' + this.trackID, {
                autoPlay: true,
                volume: 25,
                ontimedcomments: function (comments) {
                    commentCallback(comments[0].body);
                },
                onplay: playCallback,
                onstop: finish(stopCallback),
                onfinish: finish(stopCallback)
            }, function (sound) {
                SCwrapper.sound = sound;
            });
        },
        stop: function() {
            if (this.sound)
                this.sound.stop();
        }
    };

    function finish(onstop) {
        return function() {
            SCwrapper.sound = null;
            onstop();
        };
    }

	return SCwrapper;
});