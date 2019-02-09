import { newPlayer, Player, PlayerClassType, PlayerType } from '@epiclabs/epic-video-player';

import { IComparatorConfig, IPlayerData } from './models';
import { PidController } from './pid-controller';

export class Comparator {
    private static LIBRARY_PREFIX = 'evc-';
    private static PID_DIFF_OFFSET = 0.06917999999999935;
    public leftPlayer: Player<PlayerClassType>;
    public rightPlayer;
    private leftPlayerData: IPlayerData;
    private rightPlayerData: IPlayerData;
    private isSplitterSticked = true;
    private pidController: PidController;

    constructor(private config: IComparatorConfig, private container: HTMLDivElement) {
        this.setInitialValues();
        this.createVideoComparator();
        this.initListeners();
        return this;
    }

    public play(): void {
        this.leftPlayer.play();
        this.rightPlayer.play();
        this.hideSpinner();
    }

    public pause(): void {
        this.leftPlayer.pause();
        this.rightPlayer.pause();
    }

    public togglePlayPause(): void {
        if (this.leftPlayer. htmlPlayer.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    public seek(time: number): void {
        this.showSpinner();
        this.leftPlayer.currentTime(time);
        this.rightPlayer.currentTime(time);
    }

    public reload(): void {
        this.setInitialValues();
        this.cleanVideoComparator();
        this.createVideoComparator();
        this.initListeners();
    }

    public fullScreen(): void {
        alert('Coming soon!');
        // const container = this.container.parentNode as any;
        // if (container.requestFullscreen) {
        //     container.requestFullscreen();
        // } else if (container.msRequestFullscreen) {
        //     container.msRequestFullscreen();
        // } else if (container.mozRequestFullScreen) {
        //     container.mozRequestFullScreen();
        // } else if (container.webkitRequestFullscreen) {
        //     container.webkitRequestFullscreen();
        // }
        // this.resizePlayers();
    }

    private cleanVideoComparator(): void {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    private seekInner($event): void {
        const seekBar = (this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}seek-bar`)[0] as HTMLDivElement);
        const seekBarInner = (this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}seek-bar-inner`)[0] as HTMLDivElement);
        const time = $event.offsetX * this.leftPlayerData.duration / seekBar.offsetWidth;
        seekBarInner.style.width = (time / this.leftPlayerData.duration * 100) + '%';
        this.seek(time);
    }

    private createVideoComparator(): void {
        const wrapper = document.createElement('div');
        wrapper.className = `${Comparator.LIBRARY_PREFIX}wrapper`;

        const leftVideoWrapper = this.createVideoPlayer('left');
        const rightVideoWrapper = this.createVideoPlayer('right');
        wrapper.appendChild(leftVideoWrapper);
        wrapper.appendChild(rightVideoWrapper);

        this.container.appendChild(this.createLoadingSpinner());
        this.container.appendChild(wrapper);
        if (this.config.renderMediaControls !== false) {
            this.container.appendChild(this.createMediaControls());
        }
        this.container.classList.add(`${Comparator.LIBRARY_PREFIX}container`);

        this.leftPlayer = newPlayer(this.config.leftUrl, leftVideoWrapper.getElementsByTagName('video')[0], undefined);
        this.rightPlayer = newPlayer(this.config.rightUrl, rightVideoWrapper.getElementsByTagName('video')[0], undefined);
    }

    private createVideoPlayer(player: 'left' | 'right'): HTMLDivElement {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = `${Comparator.LIBRARY_PREFIX}${player}-video-wrapper`;
        const videoElement = document.createElement('video');
        videoElement.className = `${Comparator.LIBRARY_PREFIX}video`;
        videoElement.muted = true;
        videoElement.autoplay = false;
        videoWrapper.appendChild(videoElement);
        return videoWrapper;
    }

    private createLoadingSpinner(): HTMLDivElement {
        const loadingSpiner = document.createElement('div');
        loadingSpiner.className = `${Comparator.LIBRARY_PREFIX}loading-spinner`;
        loadingSpiner.innerHTML = '<div><div></div></div>';
        return loadingSpiner;
    }

    private createMediaControls(): HTMLDivElement {
        const controls = document.createElement('div');
        controls.className = `${Comparator.LIBRARY_PREFIX}media-controls`;

        const playPause = document.createElement('div');
        playPause.className = `${Comparator.LIBRARY_PREFIX}play-pause`;
        playPause.onclick = () => this.togglePlayPause();
        controls.appendChild(playPause);

        const reload = document.createElement('div');
        reload.className = `${Comparator.LIBRARY_PREFIX}reload`;
        reload.title = 'Reload';
        reload.onclick = () => this.reload();
        reload.appendChild(document.createElement('div'));
        controls.appendChild(reload);

        const seekBar = document.createElement('div');
        seekBar.className = `${Comparator.LIBRARY_PREFIX}seek-bar`;
        seekBar.onclick = ($event) => this.seekInner($event);
        const seekBarInner = document.createElement('div');
        seekBarInner.className = `${Comparator.LIBRARY_PREFIX}seek-bar-inner`;
        seekBar.appendChild(seekBarInner);
        controls.appendChild(seekBar);

        const fullScreen = document.createElement('div');
        fullScreen.className = `${Comparator.LIBRARY_PREFIX}full-screen`;
        fullScreen.title = 'Full screen';
        fullScreen.onclick = () => this.fullScreen();
        controls.appendChild(fullScreen);

        return controls;
    }

    private setInitialValues() {
        this.leftPlayerData = this.rightPlayerData = {
            duration: undefined,
            isInitialized: false,
        };
        this.pidController = undefined;
    }

    private setPidController() {
        const target = this.leftPlayer.playerType === this.rightPlayer.playerType ? 0 :
            Comparator.PID_DIFF_OFFSET;

        this.pidController = new PidController(0.5, 0.1, 0.1, target);
    }

    private showSpinner(): void {
        this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}loading-spinner`)[0].classList.remove('hidden');
    }

    private hideSpinner(): void {
        this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}loading-spinner`)[0].classList.add('hidden');
    }

    /**
     * Event listeners
     */

    private initListeners(): void {
        this.leftPlayer.htmlPlayer.oncanplaythrough = () => this.onCanPlayThrough('left');
        this.leftPlayer.htmlPlayer.onended = () => this.onEnded();
        this.leftPlayer.htmlPlayer.onloadstart = () => this.onLoadStart();
        this.leftPlayer.htmlPlayer.onpause = () => this.onPause();
        this.leftPlayer.htmlPlayer.onplay = () => this.onPlay();
        this.leftPlayer.htmlPlayer.onseeked = () => this.onSeeked('left');
        this.leftPlayer.htmlPlayer.onseeking = () => this.onSeeking();
        this.leftPlayer.htmlPlayer.ontimeupdate = () => this.onTimeUpdate();

        this.rightPlayer.htmlPlayer.oncanplaythrough = () => this.onCanPlayThrough('right');
        this.rightPlayer.htmlPlayer.onended = () => this.onEnded();
        this.leftPlayer.htmlPlayer.onpause = () => this.onPause();
        this.leftPlayer.htmlPlayer.onplay = () => this.onPlay();
        this.rightPlayer.htmlPlayer.onseeked = () => this.onSeeked('right');
        this.rightPlayer.htmlPlayer.onseeking = () => this.onSeeking();
        this.rightPlayer.htmlPlayer.ontimeupdate = () => this.onTimeUpdate();

        const wrapper = this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}wrapper`)[0] as HTMLDivElement;

        const moveSplit = (event) => {
            if (!this.isSplitterSticked) {
                const leftWrapper = (wrapper.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}left-video-wrapper`)[0] as HTMLDivElement);
                leftWrapper.style.width = event.offsetX + 'px';
                leftWrapper.getElementsByTagName('video')[0].style.width = wrapper.offsetWidth + 'px';
            }
        };

        const stickSplit = (event) => {
            this.isSplitterSticked = !this.isSplitterSticked;
            if (!this.isSplitterSticked) {
                moveSplit(event);
            }
        };

        wrapper.onmousemove = moveSplit;
        wrapper.ontouchstart = moveSplit;
        wrapper.ontouchmove = moveSplit;
        wrapper.onclick = stickSplit;
        window.addEventListener('resize', (event) => this.resizePlayers());
    }

    private onCanPlayThrough(player: 'left' | 'right') {
        if (!this.leftPlayerData.isInitialized || !this.rightPlayerData.isInitialized) {
            if (player === 'left') {
                this.leftPlayerData.isInitialized = true;
                this.leftPlayerData.duration = this.leftPlayer.htmlPlayer.duration;
                this.leftPlayer.htmlPlayer.oncanplay = undefined;
                if (this.rightPlayerData.isInitialized) {
                    this.hideSpinner();
                    this.resizePlayers();
                    this.play();
                }
            } else {
                this.rightPlayerData.isInitialized = true;
                this.rightPlayerData.duration = this.leftPlayer.htmlPlayer.duration;
                this.rightPlayer.htmlPlayer.oncanplay = undefined;
                if (this.leftPlayerData.isInitialized) {
                    this.hideSpinner();
                    this.resizePlayers();
                    this.play();
                }
            }
        }
    }

    private onEnded(): void {
        if (this.config.loop !== false) {
            this.reload();
        }
    }

    private onLoadStart() {
        this.container.classList.add('loaded-metadata');
        this.leftPlayer.htmlPlayer.oncanplay = undefined;
    }

    private onSeeked(player: 'left' | 'right'): void {
        if (player === 'left' && !this.rightPlayer.htmlPlayer.seeking || player === 'right' && !this.leftPlayer.htmlPlayer.seeking) {
            this.play();
        } else {
            this.showSpinner();
            this.pause();
        }
    }

    private onSeeking(): void {
        this.showSpinner();
    }

    private onPlay() {
        this.play();
        const playPause = this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}play-pause`)[0] as HTMLDivElement;
        if (playPause !== undefined) {
            playPause.classList.add('playing');
            playPause.title = 'Pause';
        }
    }

    private onPause() {
        this.pause();
        const playPause = this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}play-pause`)[0] as HTMLDivElement;
        if (playPause !== undefined) {
            playPause.classList.remove('playing');
            playPause.title = 'Play';
        }
    }

    private onTimeUpdate() {
        if (!this.pidController) {
            this.setPidController();
        }

        const leftCurrentTime = this.leftPlayer.currentTime() as number;
        const rightCurrentTime = this.rightPlayer.currentTime() as number;

        const seekBarInner = (this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}seek-bar-inner`)[0] as HTMLDivElement);
        if (seekBarInner !== undefined) {
            seekBarInner.style.width = (leftCurrentTime / this.leftPlayerData.duration * 100) + '%';
        }

        const diff = leftCurrentTime - rightCurrentTime;
        const update = this.pidController.update(diff);
        let rate = 1 + update;
        rate = rate < 0.0625 ? 0.0625 : rate > 2 ? 2 : rate;
        this.leftPlayer.playbackRate(rate);
    }

    private resizePlayers(): void {
        const wrapper = this.container.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}wrapper`)[0] as HTMLDivElement;
        const wrapperWidth = wrapper.offsetWidth;
        const leftWrapper = (wrapper.getElementsByClassName(`${Comparator.LIBRARY_PREFIX}left-video-wrapper`)[0] as HTMLDivElement);
        leftWrapper.style.width = (wrapperWidth / 2) + 'px';
        leftWrapper.getElementsByTagName('video')[0].style.width = wrapperWidth + 'px';
    }
}
