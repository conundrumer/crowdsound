/**
 * SoundCloud SDK wrapper
 */
define( ['soundcloud'], function (SC) {

    var MY_CLIENT_ID = 'f4352d8c413a0a2ab164d974da1c9083',
    PAGE_SIZE = 200,
    MAX_OFFSET = 8000;

	var SCwrapper = {
        trackID: null,
        trackUrl: null,

        init: function () {
            SC.initialize({
                client_id: MY_CLIENT_ID
            });
        },

        setTrack: function (trackUrl, callback) {
            if (this.trackUrl === trackUrl) return;
            this.trackUrl = trackUrl;
            this.comments = []; // reset comments
            callback = callback || function() {};
            var self = this;
            SC.get('/resolve', { url: trackUrl },
                function (trackData) {
                    self.trackID = trackData.id;
                    self.setComments(0, callback);
                });
        },

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

        play: function(commentCallback) {
            SC.stream('/tracks/' + this.trackID, {
                autoPlay: true,
                volume: 25,
                ontimedcomments: function (comments) {
                    commentCallback(comments[0].body);
                }
            });
        }
    };

	return SCwrapper;
});