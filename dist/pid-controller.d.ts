export declare class PidController {
    private kP;
    private kI;
    private kD;
    private target;
    private sumError;
    private lastError;
    private lastTime;
    private dT;
    private iMax;
    private currentValue;
    constructor(kP: number, kI: number, kD: number, target: number);
    update(currentValue: any): number;
    reset(): void;
}
