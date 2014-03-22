/**
 * Polyphonic Text-to-speech
 */
define( ['mespeak'], function (meSpeak) {

    // bias towards male voice because bros are obnoxious
    var variants = ["f1", "f2", "f3", "f4", "f5",
    "m1", "m2", "m3", "m4", "m5", "m6", "m7",
    "m1", "m2", "m3", "m4", "m5", "m6", "m7"];

    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomVariant() {
        return variants[randomRange(0, variants.length - 1)];
    }

    var Polytts = {
        init: function () {
            meSpeak.loadConfig('js/lib/mespeak_config.json');
            meSpeak.loadVoice('js/lib/voices/en/en.json');
        },
        speak: function (text) {
            meSpeak.speak(text, {
                variant: randomVariant(),
                pitch: randomRange(25, 75),
                speed: Math.round(Math.pow(text.length, 0.6)) + randomRange(140, 160),
                volume: 0.5*Math.pow(text.length, -0.4) + 0.5
            });
        },
        getRawData: function (text) {
            return meSpeak.speak(text, {
                variant: randomVariant(),
                pitch: randomRange(25, 75),
                speed: Math.round(Math.sqrt(text.length)) + randomRange(140, 160),
                rawdata: true
            });
        }
    };

    return Polytts;
});