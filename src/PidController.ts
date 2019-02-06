export class PidController {
    private sumError: number;
    private lastError: number;
    private lastTime: number;

    private target: number;
    private currentValue: number;

    constructor(private kP: number, private kI: number, private kD: number, private dT?: number, private iMax?: number) {
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

    public setTarget(target): void {
        this.target = target;
    }

    public update(currentValue): number {
        this.currentValue = currentValue;

        // Calculate dt
        let dt = this.dT;
        if (!dt) {
            const currentTime = Date.now();
            if (this.lastTime === 0) { // First time update() is called
                dt = 0;
            } else {
                dt = (currentTime - this.lastTime) / 1000; // in seconds
            }
            this.lastTime = currentTime;
        }
        if (typeof dt !== 'number' || dt === 0) {
            dt = 1;
        }

        const error = (this.target - this.currentValue);
        this.sumError = this.sumError + error * dt;
        if (this.iMax > 0 && Math.abs(this.sumError) > this.iMax) {
            const sumSign = (this.sumError > 0) ? 1 : -1;
            this.sumError = sumSign * this.iMax;
        }

        const dError = (error - this.lastError) / dt;
        this.lastError = error;

        return (this.kP * error) + (this.kI * this.sumError) + (this.kD * dError);
    }

    public reset(): void {
        this.sumError = 0;
        this.lastError = 0;
        this.lastTime = 0;
    }
}
