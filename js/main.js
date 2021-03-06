requirejs.config({
    paths: {
        'jquery': "http://code.jquery.com/jquery-1.11.0.min",
        'underscore': "http://underscorejs.org/underscore-min",
        'soundcloud': "http://connect.soundcloud.com/sdk",
        'sc-widget': "http://w.soundcloud.com/player/api",
        'mespeak': "lib/mespeak",
        'react': "http://fb.me/react-0.11.1.min"
    },
    shim: {
        'jquery': {
            'exports': "$"
        },
        'underscore': {
            'exports': "_"
        },
        'soundcloud': {
            'exports': "SC"
        },
        'sc-widget': {
            'exports': "SC"
        },
        'mespeak': {
            'exports': "meSpeak"
        }
    },
    waitSeconds: 0
});

require( ['jquery', 'app'], function ( $, App ) {
    window.AudioContext = (
        window.AudioContext ||
        window.webkitAudioContext ||
        null
    );

    if (!AudioContext) {
        throw new Error("AudioContext not supported!");
    }

    $(document).ready(App.init);

});
