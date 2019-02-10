import { IPlayerConfig } from '@epiclabs/epic-video-player';

export interface IComparatorConfig {
    leftUrl: string;
    loop?: boolean;
    rightUrl: string;
    mediaControls?: boolean;
}

export interface IPlayerData {
    config?: IPlayerConfig;
    duration?: number;
    isInitialized?: boolean;
}
