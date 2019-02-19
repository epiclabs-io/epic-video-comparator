import { IRendition, IStats, newPlayer, Player, PlayerClassType } from '@epiclabs/epic-video-player';

import { IComparatorConfig, IPlayerData, IStatsConfig, StatsConfig } from './models';
import { PidController } from './pid-controller';

import * as screenfull from 'screenfull';

export class Comparator {
  private static LIB_PREFIX = 'evc-';
  private static PID_DIFF_OFFSET = 0.06917999999999935;
  private static DEFAULT_QUALITY_INDEX = 9999;
  private static DEFAULT_QUALITY_KBPS = 999999;

  public leftPlayer: Player<PlayerClassType>;
  public rightPlayer: Player<PlayerClassType>;

  private leftPlayerData: IPlayerData = {};
  private rightPlayerData: IPlayerData = {};
  private isSplitterSticked = true;
  private pidController: PidController;
  private fullScreenWrapper: HTMLDivElement;
  private isFullScreen = false;
  private statsInterval = undefined;

  constructor(private config: IComparatorConfig, private container: HTMLDivElement) {
    this.setInitialValues();
    this.createVideoComparator();
    this.initListeners();
    return this;
  }

  public pause(): void {
    this.leftPlayer.pause();
    this.rightPlayer.pause();
  }

  public play(): void {
    this.leftPlayer.play();
    this.rightPlayer.play();
    this.hideSpinner();
  }

  public togglePlayPause(): void {
    if (this.leftPlayer.htmlPlayer.paused) {
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
    this.destroy();
    this.setInitialValues();
    this.createVideoComparator();
    this.initListeners();
    if (this.isFullScreen) {
      this.toggleFullScreenClasses();
    }
  }

  public toggleFullScreen(): void {
    if (this.isFullScreen) {
      screenfull.exit().catch(() => {
        this.isFullScreen = !this.isFullScreen;
        this.toggleFullScreen();
      });
    } else {
      screenfull.request(this.container).catch(() => {
        this.isFullScreen = !this.isFullScreen;
        this.toggleFullScreen();
      });
    }
    this.resizePlayers();
  }

  public setRenditionKbps(player: 'left' | 'right' | Player<PlayerClassType>, kbps: number): IRendition {
    if (typeof kbps !== 'number') {
      return;
    }

    const playerObject = player === 'left' ? this.leftPlayer : player === 'right' ? this.rightPlayer : player;

    if (kbps < 0) {
      this.setAutoRendition(playerObject);
      return;
    }

    const renditions = this.getRenditions(playerObject);
    if (!renditions) {
      return;
    }

    let renditionBps = renditions[0].bitrate;
    let renditionIndex = 0;
    for (let i = 1; i < renditions.length; i++) {
      if (kbps >= Math.round(renditions[i].bitrate / 1000)) {
        renditionBps = renditions[i].bitrate;
        renditionIndex = i;
      }
    }

    this.setRendition(playerObject, renditionIndex, renditionBps);
    return renditions[renditionIndex];
  }

  public setRenditionIndex(player: 'left' | 'right' | Player<PlayerClassType>, index: number): IRendition {
    if (typeof index !== 'number') {
      return;
    }

    const playerObject = player === 'left' ? this.leftPlayer : player === 'right' ? this.rightPlayer : player;

    if (index < 0) {
      this.setAutoRendition(playerObject);
      return;
    }

    const renditions = this.getRenditions(playerObject);
    if (!renditions) {
      return;
    }

    if (renditions[index]) {
      this.setRendition(playerObject, index, renditions[index].bitrate);
      return renditions[index];
    }
  }

  public getRenditions(player: 'left' | 'right' | Player<PlayerClassType>): IRendition[] {
    if (player === 'left') {
      return this.leftPlayer.getRenditions();
    } else if (player === 'right') {
      return this.rightPlayer.getRenditions();
    } else {
      return player.getRenditions();
    }
  }

  public toggleStats(): void {
    const leftStatsContainer = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}left-stats`)[0] as HTMLDivElement;
    leftStatsContainer.classList.toggle('hidden');
    const rightStatsContainer = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}right-stats`)[0] as HTMLDivElement;
    rightStatsContainer.classList.toggle('hidden');
  }

  public updateStats(innerLeft: string, innerRight: string): void {
    clearInterval(this.statsInterval);
    this.config.stats = StatsConfig.customStats();
    const leftStatsContainer = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}left-stats`)[0] as HTMLDivElement;
    leftStatsContainer.innerHTML = innerLeft;
    const rightStatsContainer = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}right-stats`)[0] as HTMLDivElement;
    rightStatsContainer.innerHTML = innerRight;

  }

  public destroy(): void {
    this.destroyListeners();
    this.cleanVideoComparator();
  }

  private updateStatsBox(player: 'left' | 'right', stats: IStats, rendition: IRendition): void {
    if (this.config.stats === false || (this.config.stats as IStatsConfig).custom === true) {
      return;
    }

    let inner = '';
    const statsConfig = this.config.stats as IStatsConfig;

    if (statsConfig.showDuration !== false && stats && stats.duration > 0) {
      inner += `<p><b>Duration:</b> ${Math.round(stats.duration) } s</p>`;
    }

    if (statsConfig.showDroppedFrames !== false && stats && stats.droppedFrames >= 0) {
      inner += `<p><b>Dropped frames:</b> ${stats.droppedFrames}</p>`;
    }

    if (statsConfig.showBuffered !== false && stats && stats.buffered !== undefined) {
      inner += `<p><b>Buffered:</b> ${this.getTotalBuffer(stats.buffered)} s</p>`;
    }

    if (statsConfig.showStartupTime !== false && stats && stats.loadTime > 0) {
      inner += `<p><b>Startup time:</b> ${Math.round(stats.loadTime * 100) / 100} s</p>`;
    }

    if (statsConfig.showBitrate !== false && rendition && rendition.bitrate > 0) {
      inner += `<p><b>Bitrate:</b> ${Math.round(rendition.bitrate / 1000)} Kbps</p>`;
    }

    if (statsConfig.showResolution !== false && rendition && rendition.width > 0 && rendition.height > 0) {
      inner += `<p><b>Resolution:</b> ${rendition.width}x${rendition.height}</p>`;
    }

    if (statsConfig.showVideoCodec !== false && rendition && !!rendition.videoCodec) {
      inner += `<p><b>Video codec:</b> ${rendition.videoCodec}</p>`;
    }

    if (statsConfig.showAudioCodec !== false && rendition && !!rendition.audioCodec) {
      inner += `<p><b>Audio codec:</b> ${rendition.audioCodec}</p>`;
    }

    const statsContainer = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}${player}-stats`)[0] as HTMLDivElement;
    statsContainer.innerHTML = inner;
  }

  private getTotalBuffer(buffered: Array<{ start: number; end: number; }>): number {
    let res = 0;
    if (buffered !== undefined && buffered.length > 0) {
      for (const buffer of buffered) {
        res += (buffer.end - buffer.start);
      }
    }
    return Math.round(res);
  }

  private cleanVideoComparator(): void {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  private seekInner($event): void {
    const seekBar = (this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}seek-bar`)[0] as HTMLDivElement);
    const seekBarInner = (this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}seek-bar-inner`)[0] as HTMLDivElement);
    const time = $event.offsetX * this.leftPlayerData.duration / seekBar.offsetWidth;
    seekBarInner.style.width = (time / this.leftPlayerData.duration * 100) + '%';
    this.seek(time);
  }

  private createVideoComparator(): void {
    this.container.classList.add(`${Comparator.LIB_PREFIX}container`);

    this.fullScreenWrapper = document.createElement('div');
    this.fullScreenWrapper.className = `${Comparator.LIB_PREFIX}full-screen-wrapper`;
    this.container.appendChild(this.fullScreenWrapper);

    const wrapper = document.createElement('div');
    wrapper.className = `${Comparator.LIB_PREFIX}wrapper`;
    const leftVideoWrapper = this.createVideoPlayer('left');
    const rightVideoWrapper = this.createVideoPlayer('right');
    wrapper.appendChild(leftVideoWrapper);
    wrapper.appendChild(rightVideoWrapper);

    this.fullScreenWrapper.appendChild(this.createLoadingSpinner());
    this.fullScreenWrapper.appendChild(wrapper);
    this.fullScreenWrapper.appendChild(this.createMediaControls());

    this.leftPlayer = newPlayer(this.config.leftUrl, leftVideoWrapper.getElementsByTagName('video')[0], this.leftPlayerData.config);
    this.rightPlayer = newPlayer(this.config.rightUrl, rightVideoWrapper.getElementsByTagName('video')[0], this.rightPlayerData.config);
  }

  private createVideoPlayer(player: 'left' | 'right'): HTMLDivElement {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = `${Comparator.LIB_PREFIX}${player}-video-wrapper`;
    const videoElement = document.createElement('video');
    videoElement.className = `${Comparator.LIB_PREFIX}video`;
    videoElement.muted = true;
    videoElement.autoplay = false;
    videoWrapper.appendChild(videoElement);
    videoWrapper.appendChild(this.createStatsBox(player));
    return videoWrapper;
  }

  private createStatsBox(player: 'left' | 'right'): HTMLDivElement {
    const stats = document.createElement('div');
    stats.className = `${Comparator.LIB_PREFIX}${player}-stats`;
    stats.classList.add('hidden');
    return stats;
  }

  private createLoadingSpinner(): HTMLDivElement {
    const loadingSpiner = document.createElement('div');
    loadingSpiner.className = `${Comparator.LIB_PREFIX}loading-spinner`;
    loadingSpiner.innerHTML = '<div><div></div></div>';
    return loadingSpiner;
  }

  private createMediaControls(): HTMLDivElement {
    if (this.config.mediaControls === false) {
      return;
    }

    const controls = document.createElement('div');
    controls.className = `${Comparator.LIB_PREFIX}media-controls`;

    // play pause button
    const playPause = document.createElement('div');
    playPause.className = `${Comparator.LIB_PREFIX}play-pause`;
    playPause.onclick = () => this.togglePlayPause();
    controls.appendChild(playPause);

    // reload button
    const reload = document.createElement('div');
    reload.className = `${Comparator.LIB_PREFIX}reload`;
    reload.title = 'Reload';
    reload.onclick = () => this.reload();
    reload.appendChild(document.createElement('div'));
    controls.appendChild(reload);

    // seekbar
    const seekBar = document.createElement('div');
    seekBar.className = `${Comparator.LIB_PREFIX}seek-bar`;
    seekBar.onclick = ($event) => this.seekInner($event);
    const seekBarInner = document.createElement('div');
    seekBarInner.className = `${Comparator.LIB_PREFIX}seek-bar-inner`;
    seekBar.appendChild(seekBarInner);
    controls.appendChild(seekBar);

    // quality selector popup
    const qualitySelectorPopupWrapper = document.createElement('div');
    qualitySelectorPopupWrapper.className = `${Comparator.LIB_PREFIX}quality-selector-popup-wrapper`;
    const qualitySelectorPopup = document.createElement('div');
    qualitySelectorPopup.className = `${Comparator.LIB_PREFIX}quality-selector-popup`;
    qualitySelectorPopupWrapper.appendChild(qualitySelectorPopup);
    this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}wrapper`)[0].appendChild(qualitySelectorPopupWrapper);

    // quality selector button
    const qualitySelectorIcon = document.createElement('div');
    qualitySelectorIcon.className = `${Comparator.LIB_PREFIX}quality-icon`;
    qualitySelectorIcon.title = 'Quality selector';
    qualitySelectorIcon.onclick = ($event) => this.onQualityIconClick($event, qualitySelectorIcon, qualitySelectorPopup);
    controls.appendChild(qualitySelectorIcon);

    // fullscreen button
    const fullScreen = document.createElement('div');
    fullScreen.className = `${Comparator.LIB_PREFIX}full-screen`;
    fullScreen.title = 'Full screen';
    fullScreen.onclick = () => this.toggleFullScreen();
    controls.appendChild(fullScreen);

    return controls;
  }

  private onQualityIconClick($event: MouseEvent, icon: HTMLDivElement, popup: HTMLDivElement): void {
    popup.classList.toggle('visible');
    icon.classList.toggle('active');
  }

  private setInitialValues() {
    this.leftPlayerData = {
      config: this.leftPlayerData.config || {
        initialRenditionIndex: Comparator.DEFAULT_QUALITY_INDEX,
        initialRenditionKbps: Comparator.DEFAULT_QUALITY_KBPS,
      },
      duration: undefined,
      isInitialized: false,
    };

    this.rightPlayerData = {
      config: this.rightPlayerData.config || {
        initialRenditionIndex: Comparator.DEFAULT_QUALITY_INDEX,
        initialRenditionKbps: Comparator.DEFAULT_QUALITY_KBPS,
      },
      duration: undefined,
      isInitialized: false,
    };

    this.pidController = undefined;

    if (this.config.stats === undefined) {
      this.config.stats = StatsConfig.defaultStats();
    } else if ((this.config.stats as IStatsConfig).custom === true) {
      this.config.stats = StatsConfig.customStats();
    }
  }

  private setPidController() {
    const target = this.leftPlayer.playerType === this.rightPlayer.playerType ? 0 :
      Comparator.PID_DIFF_OFFSET;

    this.pidController = new PidController(0.5, 0.1, 0.1, target);
  }

  private showSpinner(): void {
    this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}loading-spinner`)[0].classList.remove('hidden');
  }

  private hideSpinner(): void {
    this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}loading-spinner`)[0].classList.add('hidden');
  }

  private populateQualitySelector(): void {
    const popup = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}quality-selector-popup`)[0];

    while (popup.firstChild) {
      popup.removeChild(popup.firstChild);
    }

    this.populateQualitySelectorSide(this.leftPlayer, this.leftPlayerData, popup as HTMLDivElement);
    this.populateQualitySelectorSide(this.rightPlayer, this.rightPlayerData, popup as HTMLDivElement);
  }

  private populateQualitySelectorSide(player: Player<PlayerClassType>, data: IPlayerData, popup: HTMLDivElement) {
    const [renditions, currentRendition] = [player.getRenditions(), player.getCurrentRendition()];

    const sideElementList = document.createElement('ul');

    if (!renditions) {
      return;
    }

    if (data.config.initialRenditionIndex === Comparator.DEFAULT_QUALITY_INDEX &&
        data.config.initialRenditionKbps === Comparator.DEFAULT_QUALITY_KBPS) {
      data.config.initialRenditionIndex = renditions.length - 1;
      data.config.initialRenditionKbps = renditions[renditions.length - 1].bitrate / 1000;
    }

    const listItemAuto = document.createElement('li');
    listItemAuto.innerHTML = `${ data.config.initialRenditionIndex === -1 ? '> ' : ''}Auto`;
    listItemAuto.onclick = () => this.setAutoRendition(player);
    sideElementList.appendChild(listItemAuto);

    for (let i = 0; i < renditions.length; i++) {
      const listItem = document.createElement('li');
      const selected = data.config.initialRenditionIndex === i ? '> ' : '';
      const [width, height, kbps] = [renditions[i].width, renditions[i].height, Math.round(renditions[i].bitrate / 1000)];
      listItem.innerHTML = `${ selected }${ width }x${ height } (${ kbps } kbps)`;
      listItem.className = currentRendition && renditions[i].bitrate === currentRendition.bitrate ? 'current' : '';
      listItem.onclick = () => this.setRendition(player, i, renditions[i].bitrate);
      sideElementList.appendChild(listItem);
    }

    const sideElement = document.createElement('div');
    const side = player === this.leftPlayer ? 'LEFT' : 'RIGHT';
    sideElement.innerHTML = `<p><b>${ side }</b></p>`;
    sideElement.appendChild(sideElementList);
    popup.appendChild(sideElement);
  }

  private setRendition(player: Player<PlayerClassType>, index: number, bitrate: number): void {
    player.config.initialRenditionIndex = index;
    player.config.initialRenditionKbps = bitrate >= 0 ? Math.round(bitrate / 1000) + 1 : -1;

    if (player === this.leftPlayer) {
      this.leftPlayerData.config.initialRenditionIndex = index;
    } else {
      this.rightPlayerData.config.initialRenditionIndex = index;
    }
    this.reload();
  }

  private setAutoRendition(player: Player<PlayerClassType>): void {
    this.setRendition(player, -1, -1);
  }

  /**
   * Event listeners
   */

  private initListeners(): void {
    screenfull.on('change', this.onFullscreenChange);

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

    const wrapper = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}wrapper`)[0] as HTMLDivElement;
    const popupWrapper = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}quality-selector-popup-wrapper`)[0];
    const leftStatsWrappers = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}left-stats`)[0];
    const rightStatsWrappers = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}right-stats`)[0];

    const moveSplit = (event) => {
      if (!this.isSplitterSticked) {
        const leftWrapper = (wrapper.getElementsByClassName(`${Comparator.LIB_PREFIX}left-video-wrapper`)[0] as HTMLDivElement);
        leftWrapper.style.width = event.offsetX + 'px';
        leftWrapper.getElementsByTagName('video')[0].style.width = wrapper.offsetWidth + 'px';
      }
    };

    const stickSplit = (event) => {
      this.isSplitterSticked = !this.isSplitterSticked;
      if (!this.isSplitterSticked) {
        moveSplit(event);
      }
      popupWrapper.classList.toggle('moving-split');
      leftStatsWrappers.classList.toggle('moving-split');
      rightStatsWrappers.classList.toggle('moving-split');
    };

    wrapper.onmousemove = moveSplit;
    wrapper.ontouchstart = moveSplit;
    wrapper.ontouchmove = moveSplit;
    wrapper.onclick = stickSplit;
    window.addEventListener('resize', this.resizePlayers);

    if (this.config.stats !== false) {
      leftStatsWrappers.classList.remove('hidden');
      rightStatsWrappers.classList.remove('hidden');
      this.updateStatsBox('left', this.leftPlayer.getStats(), this.leftPlayer.getCurrentRendition());
      this.updateStatsBox('right', this.rightPlayer.getStats(), this.rightPlayer.getCurrentRendition());
      this.statsInterval = setInterval(() => {
        this.updateStatsBox('left', this.leftPlayer.getStats(), this.leftPlayer.getCurrentRendition());
        this.updateStatsBox('right', this.rightPlayer.getStats(), this.rightPlayer.getCurrentRendition());
      }, 1500);
    }
  }

  private destroyListeners(): void {
    screenfull.off('change', this.onFullscreenChange);

    clearInterval(this.statsInterval);

    this.leftPlayer.htmlPlayer.oncanplaythrough = undefined;
    this.leftPlayer.htmlPlayer.onended = undefined;
    this.leftPlayer.htmlPlayer.onloadstart = undefined;
    this.leftPlayer.htmlPlayer.onpause = undefined;
    this.leftPlayer.htmlPlayer.onplay = undefined;
    this.leftPlayer.htmlPlayer.onseeked = undefined;
    this.leftPlayer.htmlPlayer.onseeking = undefined;
    this.leftPlayer.htmlPlayer.ontimeupdate = undefined;

    this.rightPlayer.htmlPlayer.oncanplaythrough = undefined;
    this.rightPlayer.htmlPlayer.onended = undefined;
    this.leftPlayer.htmlPlayer.onpause = undefined;
    this.leftPlayer.htmlPlayer.onplay = undefined;
    this.rightPlayer.htmlPlayer.onseeked = undefined;
    this.rightPlayer.htmlPlayer.onseeking = undefined;

    const wrapper = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}wrapper`)[0] as HTMLDivElement;
    wrapper.onmousemove = undefined;
    wrapper.ontouchstart = undefined;
    wrapper.ontouchmove = undefined;
    wrapper.onclick = undefined;
    window.removeEventListener('resize', this.resizePlayers);
  }

  private onCanPlayThrough(player: 'left' | 'right') {
    if (!this.leftPlayerData.isInitialized || !this.rightPlayerData.isInitialized) {
      if (player === 'left') {
        this.leftPlayerData.isInitialized = true;
        this.leftPlayerData.duration = this.leftPlayer.htmlPlayer.duration;
        this.leftPlayer.htmlPlayer.oncanplay = undefined;
        if (this.rightPlayerData.isInitialized) {
          this.onCanPlayThroughBoth();
        }
      } else {
        this.rightPlayerData.isInitialized = true;
        this.rightPlayerData.duration = this.leftPlayer.htmlPlayer.duration;
        this.rightPlayer.htmlPlayer.oncanplay = undefined;
        if (this.leftPlayerData.isInitialized) {
          this.onCanPlayThroughBoth();
        }
      }
    }
  }

  private onCanPlayThroughBoth(): void {
    this.hideSpinner();
    this.resizePlayers();
    this.populateQualitySelector();
    this.updatePlayersData();
    this.play();
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
      this.pause();
      this.showSpinner();
    }
  }

  private onSeeking(): void {
    this.pause();
    this.showSpinner();
  }

  private onPlay() {
    this.play();
    const playPause = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}play-pause`)[0] as HTMLDivElement;
    if (playPause !== undefined) {
      playPause.classList.add('playing');
      playPause.title = 'Pause';
    }
  }

  private onPause() {
    this.pause();
    const playPause = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}play-pause`)[0] as HTMLDivElement;
    if (playPause !== undefined) {
      playPause.classList.remove('playing');
      playPause.title = 'Play';
    }
  }

  private onTimeUpdate() {
    if (!this.pidController) {
      this.setPidController();
    }

    if (this.updatePlayersData()) {
      this.populateQualitySelector();
    }

    const leftCurrentTime = this.leftPlayer.currentTime() as number;
    const rightCurrentTime = this.rightPlayer.currentTime() as number;

    const seekBarInner = (this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}seek-bar-inner`)[0] as HTMLDivElement);
    if (seekBarInner !== undefined) {
      seekBarInner.style.width = (leftCurrentTime / this.leftPlayerData.duration * 100) + '%';
    }

    const diff = leftCurrentTime - rightCurrentTime;
    const update = this.pidController.update(diff);
    let rate = 1 + update;
    rate = rate < 0.0625 ? 0.0625 : rate > 2 ? 2 : rate;
    this.leftPlayer.playbackRate(rate);
  }

  private updatePlayersData(): boolean {
    const lChanged = this.updatePlayerData(this.leftPlayer, this.leftPlayerData);
    const rChanged = this.updatePlayerData(this.rightPlayer, this.rightPlayerData);
    return lChanged || rChanged;
  }

  // returns true if any value has changed
  private updatePlayerData(player: Player<PlayerClassType>, data: IPlayerData): boolean {
    let changed = false;

    const currentRendition = player.getCurrentRendition();

    if (currentRendition) {
      changed = data.currentBitrate !== currentRendition.bitrate ? true : changed;
      data.currentBitrate = currentRendition.bitrate;

      changed = data.currentWidth !== currentRendition.width ? true : changed;
      data.currentWidth = currentRendition.width;

      changed = data.currentHeight !== currentRendition.height ? true : changed;
      data.currentHeight = currentRendition.height;
    }

    const renditions = player.getRenditions();
    changed = this.areEqualRenditions(renditions, data.renditions) === false ? true : changed;
    data.renditions = renditions;

    return changed;
  }

  private areEqualRenditions(rend1: IRendition[], rend2: IRendition[]): boolean {
    if (rend1 === undefined || rend2 === undefined || rend1.length !== rend2.length) {
      return false;
    }

    if (rend1.length > 0 && rend2.length > 0) {
      for (let i = 0; i < rend1.length; i++) {
        if (rend1[i].bitrate !== rend2[i].bitrate && rend1[i].level !== rend2[i].level && rend1[i].height !== rend2[i].height) {
          return false;
        }
      }
    }

    return true;
  }

  private onFullscreenChange = () => {
    this.isFullScreen = !this.isFullScreen;
    this.toggleFullScreenClasses();
    this.resizePlayers();
  };

  private toggleFullScreenClasses(): void {
    this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}wrapper`)[0].classList.toggle('full-screen-mode');
    this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}media-controls`)[0].classList.toggle('full-screen-mode');
  }

  private resizePlayers = () => {
    const wrapper = this.container.getElementsByClassName(`${Comparator.LIB_PREFIX}wrapper`)[0] as HTMLDivElement;
    const wrapperWidth = wrapper.offsetWidth;
    const leftWrapper = (wrapper.getElementsByClassName(`${Comparator.LIB_PREFIX}left-video-wrapper`)[0] as HTMLDivElement);
    leftWrapper.style.width = (wrapperWidth / 2) + 'px';
    leftWrapper.getElementsByTagName('video')[0].style.width = wrapperWidth + 'px';
  };
}
