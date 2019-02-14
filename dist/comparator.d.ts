import { IRendition, Player, PlayerClassType } from '@epiclabs/epic-video-player';
import { IComparatorConfig } from './models';
export declare class Comparator {
    private config;
    private container;
    private static LIB_PREFIX;
    private static PID_DIFF_OFFSET;
    private static DEFAULT_QUALITY_INDEX;
    private static DEFAULT_QUALITY_KBPS;
    leftPlayer: Player<PlayerClassType>;
    rightPlayer: Player<PlayerClassType>;
    private leftPlayerData;
    private rightPlayerData;
    private isSplitterSticked;
    private pidController;
    private fullScreenWrapper;
    private isFullScreen;
    constructor(config: IComparatorConfig, container: HTMLDivElement);
    play(): void;
    pause(): void;
    togglePlayPause(): void;
    seek(time: number): void;
    reload(): void;
    toggleFullScreen(): void;
    setRenditionKbps(player: 'left' | 'right' | Player<PlayerClassType>, kbps: number): IRendition;
    setRenditionIndex(player: 'left' | 'right' | Player<PlayerClassType>, index: number): IRendition;
    getRenditions(player: 'left' | 'right' | Player<PlayerClassType>): IRendition[];
    destroy(): void;
    private cleanVideoComparator;
    private seekInner;
    private createVideoComparator;
    private createVideoPlayer;
    private createLoadingSpinner;
    private createMediaControls;
    private onQualityIconClick;
    private setInitialValues;
    private setPidController;
    private showSpinner;
    private hideSpinner;
    private populateQualitySelector;
    private populateQualitySelectorSide;
    private setRendition;
    private setAutoRendition;
    /**
     * Event listeners
     */
    private initListeners;
    private destroyListeners;
    private onCanPlayThrough;
    private onCanPlayThroughBoth;
    private onEnded;
    private onLoadStart;
    private onSeeked;
    private onSeeking;
    private onPlay;
    private onPause;
    private onTimeUpdate;
    private updatePlayersData;
    private updatePlayerData;
    private areEqualRenditions;
    private onFullscreenChange;
    private toggleFullScreenClasses;
    private resizePlayers;
}