// worker for meSpeak.js
importScripts('lib/mespeak.js');
meSpeak.loadConfig('lib/mespeak_config.json');

self.addEventListener('message', function(e) {
    var data = e.data;
    if (data.init) {
        meSpeak.loadVoice('lib/voices/en/' + data.accent + '.json');
        return;
    }
    var buffer = meSpeak.speak(data.text, data.config, function(){});
    self.postMessage({
        buffer: buffer,
        workerid: data.workerid,
        comment: data.comment,
        time: data.time
    }, [buffer]);
}, false);