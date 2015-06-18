function Device() {

    var device = this;
    var listener = null;
    var filters = [];
    var data = [];
    var busy = false;
    var timer = 0;
    var delay = 1000;

    this.start = function () {
        device.addFilter(new IdleFilter());     //Determines if device is in idle state
        device.addFilter(new MotionFilter());   //Determines if the device is in motion (based on IdleFilter data)
        device.addFilter(new DEFilter());       //Determines if the current event differs enough from the previous one

        device.startTrackingOrientation();
    };

    //Tracking orientation
    this.startTrackingOrientation = function () {
        //console.log("startTrackingOrientation ", filters)
        var vector;
        if (window.DeviceOrientationEvent) {
            // Listen for the deviceorientation event and handle the raw data
            listener = function (eventData) {
                if (!busy) {
                    // gamma is the left-to-right tilt in degrees, where right is positive
                    var tiltLeftRight = eventData.gamma;

                    // beta is the front-to-back tilt in degrees, where front is positive
                    var tiltFrontBack = eventData.beta;

                    // alpha is the compass direction the device is facing in degrees
                    var direction = eventData.alpha

                    // call our orientation event handler
                    deviceOrientationHandler(tiltLeftRight, tiltFrontBack, direction);
                }
            };
            window.addEventListener('deviceorientation', listener, false);
        }

        function deviceOrientationHandler(tiltLR, tiltFB, dir) {
            vector = [tiltLR, tiltFB, dir];
            //console.log("deviceOrientationHandler ", vector);
            for (var i = 0; i < filters.length; i++) {
                vector = filters[i].filter(vector);
            }
            if (vector != null) {
                data.push(vector);
                if (demo.getType() !== "searchall") {
                    console.log("deviceOrientationHandler ", vector);
                }
            }
        }
    }

    this.processAndSendData = function () {
        if (data[0]) {
            var gesture = getGesture();
            if (gesture != null && !busy) {
                document.dispatchEvent(new CustomEvent("GOT_GESTURE", {
                    "detail": gesture
                }));
                if (demo.getType() === "motion") {
                    ui.message(gesture);
                }
                console.log(gesture);
                busy = true;
                timer = setTimeout(function () {
                    busy = false;
                    data = [];
                }, delay);
            }
            data = [];
        }

        function getGesture() {
            var item_0 = data[0],
                item_last = data[data.length - 1],
                retval = null;
            var gamma_delta = item_0[0] - item_last[0]

            if (item_last[0] < -70 || item_last[0] > 70) {
                return "UPSIDE_DOWN";
            }
            if (item_last[1] - item_0[1] < -20) {
                return "TILT_BACK";
            }
            if (item_last[1] - item_0[1] > 10) {
                return "TILT_FORWARD";
            }
            if (item_last[0] > 30 && ui.touchInProgress) {
                return "TILT_RIGHT_PRESS";
            }
            if (item_last[0] > 30) {
                return "TILT_RIGHT";
            }
            if (item_last[0] < -30) {
                return "TILT_LEFT";
            }

            return retval;
        }
    };

    this.addFilter = function (filter) {
        filters.push(filter);
    };

    this.stop = function () {
        console.log("Stopping device orientation listener...");
        window.removeEventListener("deviceorientation", listener);
    };

    document.addEventListener("DEVICE_MOTION_STOPPED", function (e) {
        device.processAndSendData();
    });
}
