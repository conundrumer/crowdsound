/**
 * SoundCloud SDK wrapper
 */
define( ['soundcloud'], function (SC) {

    var MY_CLIENT_ID = 'f4352d8c413a0a2ab164d974da1c9083';

	var SCwrapper = {
        init: function () {
            SC.initialize({
                client_id: MY_CLIENT_ID
            });
        },
        getComments: function (url) {
            console.error("Not yet implemented");
        }
    };

	return SCwrapper;
});