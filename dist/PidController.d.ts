export declare class PidController {
    private kP;
    private kI;
    private kD;
    private dT?;
    private iMax?;
    private sumError;
    private lastError;
    private lastTime;
    private target;
    private currentValue;
    constructor(kP: number, kI: number, kD: number, dT?: number, iMax?: number);
    setTarget(target: any): void;
    update(currentValue: any): number;
    reset(): void;
}
