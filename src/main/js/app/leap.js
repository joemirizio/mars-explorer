(function () {
    var module = angular.module('mars.leap', []);

    module.provider('leap', function () {
        var _config;
        var previousMotorValues = [0, 0];
        var controllerOptions = {};

        this.config = function (config) {
            _config = config;
        };

        var start = function (rover) {
            var that = this;
            var motorSpeed = 0.5;
            var motorLeft = document.querySelector('.motor-left');
            var motorRight = document.querySelector('.motor-right');

            Leap.loop(function(frame) {
                var leftHandDetected = false;
                var rightHandDetected = false;
                var motorValues = [0, 0];
                var handValues = [0, 0];
                var i;
                // Iterate over hands
                for (i = 0; i < frame.hands.length; i++) {
                    var hand = frame.hands[i];
                    var handIndex = (hand.type === 'left') ? 0 : 1;

                    if (hand.type === 'left') {
                        leftHandDetected = true;
                    } else {
                        rightHandDetected = true;
                    }

                    var value = hand.sphereCenter[2].toFixed(_config.precision);
                    handValues[handIndex] = value;

                    if (value > _config.stopZone[0] && value < _config.stopZone[1]) {
                        value = 0;
                    } else if (value >= _config.stopZone[1]) {
                        value = map(value, _config.stopZone[1], _config.max, 0, -motorSpeed);
                    } else {
                        value = map(value, _config.min, _config.stopZone[0], motorSpeed, 0);
                    }
                    value = value.toFixed(_config.precision);
                    motorValues[handIndex] = value;
                }

                // Warn user if hand is not detected
                if (!leftHandDetected && !motorLeft.classList.contains('warning')) {
                    motorLeft.classList.add('warning');
                } else if (leftHandDetected && motorLeft.classList.contains('warning')) {
                    motorLeft.classList.remove('warning');
                }
                if (!rightHandDetected && !motorRight.classList.contains('warning')) {
                    motorRight.classList.add('warning');
                } else if (rightHandDetected && motorRight.classList.contains('warning')) {
                    motorRight.classList.remove('warning');
                }

                var changeEvent = new Event('change');

                if (frame.hands.length === 0) {
                    motorValues[0] = 0;
                    motorValues[1] = 0;
                }

                if (previousMotorValues[0] !== motorValues[0] || previousMotorValues[1] !== motorValues[1]) {
                    rover.navigation.left = motorValues[0];
                    rover.navigation.right = motorValues[1];
                    rover.update();
                    motorLeft.dispatchEvent(changeEvent);
                }

                previousMotorValues[0] = motorValues[0];
                previousMotorValues[1] = motorValues[1];
            });
        };

        this.$get = function () {
            return {
                start: start
            };
        };
    });
}());
