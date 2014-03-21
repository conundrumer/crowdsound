/**
 * Polyphonic Text-to-speech
 */
define( ['mespeak'], function (meSpeak) {

    var Polytts = {
        init: function () {
            meSpeak.loadConfig('js/lib/mespeak_config.json');
            meSpeak.loadVoice('js/lib/voices/en/en.json');
        },
        hello: function () {
            meSpeak.speak('hello world');
        }
    };

    return Polytts;
});