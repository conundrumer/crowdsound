/**
 * Polyphonic Text-to-speech
 */
define( function () {

    // bias towards male voice because bros are obnoxious
    var variants = ["f1", "f2", "f3", "f4", "f5",
    "m1", "m2", "m3", "m4", "m5", "m6", "m7",
    "m1", "m2", "m3", "m4", "m5", "m6", "m7"],
    context, compressor, masterGain, idleVoice;

    var id = 0;
    var NUM_WORKERS = 4;
    var workers = [];
    var idleWorkers = [];
    for (var i = 0; i < NUM_WORKERS; i++) {
        workers[i] = new Worker('js/mespeakworker.js');
        workers[i].addEventListener('message', onProcessed, false);
        idleWorkers[i] = i;
    }
    var voices, onstartcallback, onendcallback;

    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomVariant() {
        return variants[randomRange(0, variants.length - 1)];
    }

    function Voice () {
        this.id = id;
        id++;
        this.pan = context.createPanner();
        this.pan.connect(compressor);
        this.pan.panningModel = 'equalpower';
        this.pan.rolloffFactor = 0.3;
    }

    function getRandomAngle(magnitude) {
        var angle = Math.random()*2 - 1; // normalized
        angle = angle * Math.pow(Math.abs(angle),2); // bias towards center
        angle = Math.PI * (angle + 1) / 2;
        var x = Math.cos(angle),
        z = -1*Math.sin(angle);
        return {x: magnitude*x, y: 0, z: magnitude*z};
    }

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
            voices = [];
        },
        speak: function (text, comment, commentid) {
            var workerid = (idleWorkers.length > 0) ? idleWorkers.pop() : commentid%NUM_WORKERS;
            var worker = workers[workerid];
            worker.postMessage({
                'text': text,
                'config': {
                    'variant': randomVariant(),
                    'pitch': randomRange(25, 75),
                    'speed': Math.round(Math.pow(text.length, 0.7)) + randomRange(140, 160),
                    // volume: 0.5*Math.pow(text.length, -0.4) + 0.5,
                    'rawdata': true
                },
                'workerid': workerid,
                'comment': comment,
                'commentid': commentid});
        }
    };

    function onProcessed (e) {
        var data = e.data;
        idleWorkers.push(data.workerid);
        var commentid = data.commentid;
        var voice = (voices.length > 0) ? voices.pop() : new Voice();
        voice.speak(data.buffer, data.comment, commentid, function () {
            // console.log("stopping: " + voice.id);
            onendcallback(commentid);
            voices.push(voice);
        });
    }

    Voice.prototype.speak = function (buffer, comment, commentid, onend) {
        var self = this;
        this.source = context.createBufferSource();
        this.source.connect(this.pan);
        context.decodeAudioData(buffer, function (audioData) {
            var duration = audioData.duration;
            setTimeout(onend, Math.ceil(duration*1000));
            var position = getRandomAngle(duration);
            self.pan.setPosition(position.x, position.y, position.z);
            self.source.buffer = audioData;
            onstartcallback(comment, commentid);
            self.source.start(0);
        });
    };


    return Polytts;
});