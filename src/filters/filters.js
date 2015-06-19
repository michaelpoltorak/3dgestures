/**
 * Determines wether device is moving or not
 * Returns values above sensitivity threshold
 **/
function IdleFilter() {

    this.sensivity = 1;

    /**
     * @param vector: [x, y, z]
     **/

    this.filter = function (vector) {
        if (vector != null) {
            var absvalue = Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]));
            //document.getElementById("idle").value = (absvalue > 1 + this.sensivity);
            // Only return vector if above sensitivity
            if (absvalue > 0.8 + this.sensivity) {
                //console.log("***************", Math.random(1));
                return vector;
            } else {
                //console.log("...............", Math.random(1));
                return null;
            }
        }
    }
}

function DEFilter() {

    /**
     * This filter removes a vector, if it doesn't differ enough from
     * the previously retrieved vector.
     **/

    this.sensivity = 1;
    this.reference = [0.0, 0.0, 0.0];


    this.filter = function (vector) {
        //console.log("vector ", vector);
        var sensivity = this.sensivity;
        var reference = this.reference;
        if (vector != null) {
            if (vector[0] < reference[0] - sensivity ||
                vector[0] > reference[0] + sensivity ||
                vector[1] < reference[1] - sensivity ||
                vector[1] > reference[1] + sensivity ||
                vector[2] < reference[2] - sensivity ||
                vector[2] > reference[2] + sensivity) {

                this.reference = vector;
                //console.log(vector);
                return vector;
            } else {
                return null;
            }
        }
        return null
    }
}


function MotionFilter() {

    this.nowinmotion = false;
    this.motionstartstamp = new Date().getMilliseconds();
    this.motionchangetime = 52

    this.filter = function (vector) {
        if (this.nowinmotion &&
            (new Date().getMilliseconds() - this.motionstartstamp) >= this.motionchangetime) {
            this.nowinmotion = false;
            document.dispatchEvent(new CustomEvent("DEVICE_MOTION_STOPPED", {
                "detail": "Device motion ended"
            }));
            //console.log("motion stopped");
        }
        return (this.foo(vector));
    }

    this.foo = function (vector) {
        if (vector != null) {
            this.motionstartstamp = new Date().getMilliseconds();
            if (!this.nowinmotion) {
                this.nowinmotion = true;
                this.motionstartstamp = new Date().getMilliseconds();
                //this.device.fireMotionStartEvent();
                //console.log("motion started");
            }
        }
        return vector;
    }
}
