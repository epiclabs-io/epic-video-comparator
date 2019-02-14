import { IPlayerConfig, IRendition } from '@epiclabs/epic-video-player';
export interface IComparatorConfig {
    leftUrl: string;
    loop?: boolean;
    rightUrl: string;
    mediaControls?: boolean;
}
export interface IPlayerData {
    config?: IPlayerConfig;
    currentBitrate?: number;
    currentHeight?: number;
    currentWidth?: number;
    duration?: number;
    isInitialized?: boolean;
    renditions?: IRendition[];
}
