import { IPlayerConfig, IRendition } from '@epiclabs/epic-video-player';

export interface IComparatorConfig {
  autoplay?: boolean;
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

export class StatsConfig implements IStatsConfig {
  public static customStats(): IStatsConfig {
    const statsConfig = new StatsConfig();
    statsConfig.showDuration = false;
    statsConfig.showBitrate = false;
    statsConfig.showResolution = false;
    statsConfig.showVideoCodec = false;
    statsConfig.showAudioCodec = false;
    statsConfig.showDroppedFrames = false;
    statsConfig.showBuffered = false;
    statsConfig.showStartupTime = false;
    statsConfig.custom = true;
    return statsConfig;
  }

  public static defaultStats(): IStatsConfig {
    return new StatsConfig();
  }

  public showDuration = true;
  public showBitrate = true;
  public showResolution = true;
  public showVideoCodec = true;
  public showAudioCodec = true;
  public showDroppedFrames = true;
  public showBuffered = true;
  public showStartupTime = true;
  public custom = false;
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
