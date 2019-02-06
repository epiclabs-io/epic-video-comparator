export interface IComparatorConfig {
    leftUrl: string;
    loop?: boolean;
    rightUrl: string;
    renderMediaControls?: boolean;
}

export interface IPlayerData {
    isInitialized: boolean;
    duration: number;
}
