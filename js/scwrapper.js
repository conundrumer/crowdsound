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
        trackName: null,

        init: function () {
            SC.initialize({
                client_id: MY_CLIENT_ID
            });
        },

        setTrack: function (trackUrl, onload, onerror) {
            this.stop();
            onload = onload || function() {};
            this.trackUrl = trackUrl;
            var self = this;
            SC.get('/resolve', { url: trackUrl },
                function (trackData, error) {
                    if (error) {
                        onerror(error.message);
                        return;
                    }
                    self.trackID = trackData.id;
                    self.trackName = trackData.title;
                    onload();
                });
        },
        play: function(commentCallback, playCallback, stopCallback) {
            SC.stream('/tracks/' + this.trackID, {
                autoPlay: true,
                volume: 20,
                ontimedcomments: function (comments) {
                    commentCallback(comments[0].body);
                },
                onplay: function () { playCallback(SCwrapper.trackName); },
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