"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PidController = /** @class */ (function () {
    function PidController(kP, kI, kD, dT, iMax) {
        this.kP = kP;
        this.kI = kI;
        this.kD = kD;
        this.dT = dT;
        this.iMax = iMax;
        // PID constants
        this.kP = kP || 1;
        this.kI = kI || 0;
        this.kD = kD || 0;
        // Interval of time between two updates
        // If not set, it will be automatically calculated
        this.dT = dT || 0;
        // Maximum absolute value of sumError
        this.iMax = iMax || 0;
        this.sumError = 0;
        this.lastError = 0;
        this.lastTime = 0;
        this.target = 0; // default value, can be modified with .setTarget
    }
    PidController.prototype.setTarget = function (target) {
        this.target = target;
    };
    PidController.prototype.update = function (currentValue) {
        this.currentValue = currentValue;
        // Calculate dt
        var dt = this.dT;
        if (!dt) {
            var currentTime = Date.now();
            if (this.lastTime === 0) { // First time update() is called
                dt = 0;
            }
            else {
                dt = (currentTime - this.lastTime) / 1000; // in seconds
            }
            this.lastTime = currentTime;
        }
        if (typeof dt !== 'number' || dt === 0) {
            dt = 1;
        }
        var error = (this.target - this.currentValue);
        this.sumError = this.sumError + error * dt;
        if (this.iMax > 0 && Math.abs(this.sumError) > this.iMax) {
            var sumSign = (this.sumError > 0) ? 1 : -1;
            this.sumError = sumSign * this.iMax;
        }
        var dError = (error - this.lastError) / dt;
        this.lastError = error;
        return (this.kP * error) + (this.kI * this.sumError) + (this.kD * dError);
    };
    PidController.prototype.reset = function () {
        this.sumError = 0;
        this.lastError = 0;
        this.lastTime = 0;
    };
    return PidController;
}());
exports.PidController = PidController;
