/**
 * Voice unit used to play back synthesized voice in audio buffers
 */
define(function () {

    function getRandomAngle(magnitude) {
        var angle = Math.random()*2 - 1; // normalized
        angle = angle * Math.pow(Math.abs(angle),2); // bias towards center
        angle = Math.PI * (angle + 1) / 2;
        var x = Math.cos(angle),
        z = -1*Math.sin(angle);
        return {x: magnitude*x, y: 0, z: magnitude*z};
    }

    function Voice (context, outNode, onstartcallback, onendcallback) {
        this.onstartcallback = onstartcallback;
        this.onendcallback = onendcallback;
        this.active = false;
        this.playing = false;
        this.startTimer = null;

        this.context = context;
        this.pan = context.createPanner();
        this.pan.connect(outNode);
        this.pan.panningModel = 'equalpower';
        this.pan.rolloffFactor = 0.3;
    }
    
    Voice.prototype = {
        speak: function (buffer, comment, time) {
            this.active = true;
            var self = this;
            this.comment = comment;
            this.source = this.context.createBufferSource();
            this.source.connect(this.pan);
            this.context.decodeAudioData(buffer, function (audioData) {
                var duration = audioData.duration;
                var position = getRandomAngle(duration);
                self.pan.setPosition(position.x, position.y, position.z);
                self.source.buffer = audioData;
                self.startTimer = setTimeout(self.onStart.bind(self, duration), time - Date.now());
            });
        },
        onStart: function (duration) {
            // console.log("Late by " + Math.round(Date.now() - this.comment.timeToInvoke) + "ms: " + this.comment.body);
            this.onstartcallback(this.comment);
            this.source.start(0);
            this.endTimer = setTimeout(this.onEnd.bind(this), duration*1000);
            this.playing = true;
            this.startTimer = null;
        },
        onEnd: function () {
            this.onendcallback(this.comment);
            this.playing = false;
            this.active = false;
            this.startTimer = null;
        },
        cancel: function () {
            if (this.startTimer !== null) {
                clearTimeout(this.startTimer);
                console.log("canceled: " + this.comment.body);
                this.startTimer = null;
            }
        },
        stop: function () {
            if (this.playing) {
                this.source.stop();
                this.onEnd();
                console.log("stopped: " + this.comment.body);
            }
            this.cancel();
        }
    };

    return Voice;
});