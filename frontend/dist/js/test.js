(function(global) {
    function initCamera(partial, mediaConstraint) {
        // Grab elements, create settings, etc.
        var video = partial.querySelector('#video');

        // Get access to the camera!
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(mediaConstraint)
                .then(function(stream) {
                    //console.log(stream)
                    video.srcObject = stream;
                    //video.play();
                })
                .catch(function(err) {
                    console.log('failed to call getUserMedia: ' + err)
                });
        } else {
            console.log('camera feature not supported')
        }
    }

    initCamera(document.body, {video: true})
})(window)