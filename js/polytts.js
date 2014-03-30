/**
 * Polyphonic Text-to-speech. Controls comment queueing, mespeak workers, and voice units
 */
define( ['voice'],function (Voice) {

    // bias towards male voice because bros are obnoxious
    var variants = ["f1", "f2", "f3", "f4", "f5",
    "m1", "m2", "m3", "m4", "m5", "m6", "m7",
    "m1", "m2", "m3", "m4", "m5", "m6", "m7"],
    context, compressor, masterGain, idleVoice;

    var NUM_WORKERS = 4,
    workers = [],
    idleWorkers = [],
    speakQueue = [],
    voices = [],
    onstartcallback, onendcallback;

    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomVariant() {
        return variants[randomRange(0, variants.length - 1)];
    }

    function randomSpeed(length) {
        return Math.round(Math.pow(length, 0.7)) + randomRange(140, 160);
    }

    function initWorkers() {
        for (var i = 0; i < NUM_WORKERS; i++) {
            workers[i] = new Worker('js/mespeakworker.js');
            workers[i].addEventListener('message', onProcessed, false);
            idleWorkers[i] = i;
        }
    }

    var active = false;

    var Polytts = {
        init: function (onstart, onend) {
            onstartcallback = onstart;
            onendcallback = onend;
            context = new AudioContext();
            compressor = context.createDynamicsCompressor();
            masterGain = context.createGain();
            masterGain.value = 3; // make up for limiter
            compressor.threshold = -3; // act as a soft limiter
            compressor.connect(masterGain);
            masterGain.connect(context.destination);
            initWorkers();
        },
        speak: function (commentData) {
            var time = commentData.invokationTime || Date.now();
            if (idleWorkers.length === 0) {
                // console.log("Delaying: " + commentData.comment.body);
                commentData.invokationTime = time;
                speakQueue.push(commentData);
                return;
            }
            var workerid = idleWorkers.pop();
            var worker = workers[workerid];
            commentData.timeToInvoke = commentData.timeToInvoke;
            worker.postMessage({
                'text': commentData.text,
                'config': {
                    'variant': randomVariant(),
                    'pitch': randomRange(25, 75),
                    'speed': randomSpeed(commentData.text.length),
                    'rawdata': true
                },
                'workerid': workerid,
                'comment': commentData.comment,
                'time': time + commentData.delay
            });
        },
        clear: function () {
            if (speakQueue.length > 0) {
                console.log("Clearing queue: " + speakQueue.length);
                speakQueue = [];
            }
            voices.forEach(function (voice) {
                voice.cancel();
            });
        },
        stop: function () {
            this.clear();
            voices.forEach(function (voice) {
                voice.stop();
            });
        },
        setActive: function () {
            active = true;
        },
        setUnactive: function () {
            active = false;
            Polytts.clear();
        }
    };

    function onProcessed (e) {
        var data = e.data;
        var comment = data.comment;
        if (active) {
            getIdleVoice().speak(data.buffer, comment, data.time);
        }

        idleWorkers.push(data.workerid);
        if (speakQueue.length > 0) {
            Polytts.speak(speakQueue.shift());
        }
    }

    function getIdleVoice() {
        for (var i = 0; i < voices.length; i++) {
            if (voices[i].active === false) {
                return voices[i];
            }
        }
        var voice = new Voice(context, compressor, onstartcallback, onendcallback);
        voices.push(voice);
        return voice;
    }

    return Polytts;
});