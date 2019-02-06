import { Player, PlayerClassType } from '@epiclabs/epic-video-player';
import { IComparatorConfig } from './models';
export declare class Comparator {
    private config;
    private container;
    private static LIBRARY_PREFIX;
    private static PID_DIFF_OFFSET;
    leftPlayer: Player<PlayerClassType>;
    rightPlayer: any;
    private leftPlayerData;
    private rightPlayerData;
    private isSplitterSticked;
    private pidController;
    constructor(config: IComparatorConfig, container: HTMLDivElement);
    play(): void;
    pause(): void;
    togglePlayPause(): void;
    seek(time: number): void;
    reload(): void;
    fullScreen(): void;
    private cleanVideoComparator;
    private seekInner;
    private createVideoComparator;
    private createVideoPlayer;
    private createLoadingSpinner;
    private createMediaControls;
    private setInitialValues;
    private setPidController;
    private showSpinner;
    private hideSpinner;
    /**
     * Event listeners
     */
    private initListeners;
    private onCanPlayTrhough;
    private onEnded;
    private onLoadStart;
    private onSeeked;
    private onSeeking;
    private onPlay;
    private onPause;
    private onTimeUpdate;
    private resizePlayers;
}
