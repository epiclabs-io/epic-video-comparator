import { IPlayerConfig, IRendition } from '@epiclabs/epic-video-player';
export interface IComparatorConfig {
    leftUrl: string;
    loop?: boolean;
    rightUrl: string;
    mediaControls?: boolean;
    stats?: IStatsConfig | boolean;
}
export interface IStatsConfig {
    showDuration?: boolean;
    showBitrate?: boolean;
    showResolution?: boolean;
    showVideoCodec?: boolean;
    showAudioCodec?: boolean;
    showDroppedFrames?: boolean;
    showBuffered?: boolean;
    showStartupTime?: boolean;
    custom?: boolean;
}
export declare class StatsConfig implements IStatsConfig {
    static customStats(): IStatsConfig;
    static defaultStats(): IStatsConfig;
    showDuration: boolean;
    showBitrate: boolean;
    showResolution: boolean;
    showVideoCodec: boolean;
    showAudioCodec: boolean;
    showDroppedFrames: boolean;
    showBuffered: boolean;
    showStartupTime: boolean;
    custom: boolean;
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
