// worker for meSpeak.js
importScripts('lib/mespeak.js');
meSpeak.loadConfig('lib/mespeak_config.json');
meSpeak.loadVoice('lib/voices/en/en.json');

self.addEventListener('message', function(e) {
    var data = e.data;
    var buffer = meSpeak.speak(data.text, data.config, function(){});
    self.postMessage({
        buffer: buffer,
        workerid: data.workerid,
        comment: data.comment,
        commentid: data.commentid}, [buffer]);
}, false);