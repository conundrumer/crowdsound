requirejs.config({
	paths: {
		'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min",
		'soundcloud': "http://connect.soundcloud.com/sdk",
		'mespeak': "lib/mespeak"
	},
	shim: {
		'jquery': {
			'exports': "$"
		},
		'soundcloud': {
			'exports': "SC"
		},
		'mespeak': {
			'exports': "meSpeak"
		}
	}
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