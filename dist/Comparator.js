"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var epic_video_player_1 = require("@epiclabs/epic-video-player");
var PidController_1 = require("./PidController");
var Comparator = /** @class */ (function () {
    function Comparator(config, container) {
        this.config = config;
        this.container = container;
        this.isSplitterSticked = true;
        this.setInitialValues();
        this.createVideoComparator();
        this.initListeners();
        return this;
    }
    Comparator.prototype.play = function () {
        this.leftPlayer.play();
        this.rightPlayer.play();
        this.hideSpinner();
    };
    Comparator.prototype.pause = function () {
        this.leftPlayer.pause();
        this.rightPlayer.pause();
    };
    Comparator.prototype.togglePlayPause = function () {
        if (this.leftPlayer.htmlPlayer.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    };
    Comparator.prototype.seek = function (time) {
        this.showSpinner();
        this.leftPlayer.currentTime(time);
        this.rightPlayer.currentTime(time);
    };
    Comparator.prototype.reload = function () {
        this.setInitialValues();
        this.cleanVideoComparator();
        this.createVideoComparator();
        this.initListeners();
    };
    Comparator.prototype.fullScreen = function () {
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
    };
    Comparator.prototype.cleanVideoComparator = function () {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };
    Comparator.prototype.seekInner = function ($event) {
        var seekBar = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "seek-bar")[0];
        var seekBarInner = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "seek-bar-inner")[0];
        var time = $event.offsetX * this.leftPlayerData.duration / seekBar.offsetWidth;
        seekBarInner.style.width = (time / this.leftPlayerData.duration * 100) + '%';
        this.seek(time);
    };
    Comparator.prototype.createVideoComparator = function () {
        var wrapper = document.createElement('div');
        wrapper.className = Comparator.LIBRARY_PREFIX + "wrapper";
        var leftVideoWrapper = this.createVideoPlayer('left');
        var rightVideoWrapper = this.createVideoPlayer('right');
        wrapper.appendChild(leftVideoWrapper);
        wrapper.appendChild(rightVideoWrapper);
        this.container.appendChild(this.createLoadingSpinner());
        this.container.appendChild(wrapper);
        if (this.config.renderMediaControls !== false) {
            this.container.appendChild(this.createMediaControls());
        }
        this.container.classList.add(Comparator.LIBRARY_PREFIX + "container");
        this.leftPlayer = epic_video_player_1.newPlayer(this.config.leftUrl, leftVideoWrapper.getElementsByTagName('video')[0], undefined);
        this.rightPlayer = epic_video_player_1.newPlayer(this.config.rightUrl, rightVideoWrapper.getElementsByTagName('video')[0], undefined);
    };
    Comparator.prototype.createVideoPlayer = function (player) {
        var videoWrapper = document.createElement('div');
        videoWrapper.className = "" + Comparator.LIBRARY_PREFIX + player + "-video-wrapper";
        var videoElement = document.createElement('video');
        videoElement.className = Comparator.LIBRARY_PREFIX + "video";
        videoElement.muted = true;
        videoElement.autoplay = false;
        videoWrapper.appendChild(videoElement);
        return videoWrapper;
    };
    Comparator.prototype.createLoadingSpinner = function () {
        var loadingSpiner = document.createElement('div');
        loadingSpiner.className = Comparator.LIBRARY_PREFIX + "loading-spinner";
        loadingSpiner.innerHTML = '<div><div></div></div>';
        return loadingSpiner;
    };
    Comparator.prototype.createMediaControls = function () {
        var _this = this;
        var controls = document.createElement('div');
        controls.className = Comparator.LIBRARY_PREFIX + "media-controls";
        var playPause = document.createElement('div');
        playPause.className = Comparator.LIBRARY_PREFIX + "play-pause";
        playPause.onclick = function () { return _this.togglePlayPause(); };
        controls.appendChild(playPause);
        var reload = document.createElement('div');
        reload.className = Comparator.LIBRARY_PREFIX + "reload";
        reload.title = 'Reload';
        reload.onclick = function () { return _this.reload(); };
        reload.appendChild(document.createElement('div'));
        controls.appendChild(reload);
        var seekBar = document.createElement('div');
        seekBar.className = Comparator.LIBRARY_PREFIX + "seek-bar";
        seekBar.onclick = function ($event) { return _this.seekInner($event); };
        var seekBarInner = document.createElement('div');
        seekBarInner.className = Comparator.LIBRARY_PREFIX + "seek-bar-inner";
        seekBar.appendChild(seekBarInner);
        controls.appendChild(seekBar);
        var fullScreen = document.createElement('div');
        fullScreen.className = Comparator.LIBRARY_PREFIX + "full-screen";
        fullScreen.title = 'Full screen';
        fullScreen.onclick = function () { return _this.fullScreen(); };
        controls.appendChild(fullScreen);
        return controls;
    };
    Comparator.prototype.setInitialValues = function () {
        this.leftPlayerData = this.rightPlayerData = {
            duration: undefined,
            isInitialized: false,
        };
        this.pidController = undefined;
    };
    Comparator.prototype.setPidController = function () {
        this.pidController = new PidController_1.PidController(0.5, 0.1, 0.1);
        if (this.leftPlayer.playerType === epic_video_player_1.PlayerType.HLS && this.rightPlayer.playerType === epic_video_player_1.PlayerType.DASH) {
            this.pidController.setTarget(Comparator.PID_DIFF_OFFSET);
        }
        else if (this.leftPlayer.playerType === epic_video_player_1.PlayerType.DASH && this.rightPlayer.playerType === epic_video_player_1.PlayerType.HLS) {
            this.pidController.setTarget(-Comparator.PID_DIFF_OFFSET);
        }
        else {
            this.pidController.setTarget(0);
        }
    };
    Comparator.prototype.showSpinner = function () {
        this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "loading-spinner")[0].classList.remove('hidden');
    };
    Comparator.prototype.hideSpinner = function () {
        this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "loading-spinner")[0].classList.add('hidden');
    };
    /**
     * Event listeners
     */
    Comparator.prototype.initListeners = function () {
        var _this = this;
        this.leftPlayer.htmlPlayer.oncanplaythrough = function () { return _this.onCanPlayTrhough('left'); };
        this.leftPlayer.htmlPlayer.onended = function () { return _this.onEnded(); };
        this.leftPlayer.htmlPlayer.onloadstart = function () { return _this.onLoadStart(); };
        this.leftPlayer.htmlPlayer.onpause = function () { return _this.onPause(); };
        this.leftPlayer.htmlPlayer.onplay = function () { return _this.onPlay(); };
        this.leftPlayer.htmlPlayer.onseeked = function () { return _this.onSeeked('left'); };
        this.leftPlayer.htmlPlayer.onseeking = function () { return _this.onSeeking(); };
        this.leftPlayer.htmlPlayer.ontimeupdate = function () { return _this.onTimeUpdate(); };
        this.rightPlayer.htmlPlayer.oncanplaythrough = function () { return _this.onCanPlayTrhough('right'); };
        this.rightPlayer.htmlPlayer.onended = function () { return _this.onEnded(); };
        this.leftPlayer.htmlPlayer.onpause = function () { return _this.onPause(); };
        this.leftPlayer.htmlPlayer.onplay = function () { return _this.onPlay(); };
        this.rightPlayer.htmlPlayer.onseeked = function () { return _this.onSeeked('right'); };
        this.rightPlayer.htmlPlayer.onseeking = function () { return _this.onSeeking(); };
        this.rightPlayer.htmlPlayer.ontimeupdate = function () { return _this.onTimeUpdate(); };
        var wrapper = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "wrapper")[0];
        var moveSplit = function (event) {
            if (!_this.isSplitterSticked) {
                var leftWrapper = wrapper.getElementsByClassName(Comparator.LIBRARY_PREFIX + "left-video-wrapper")[0];
                leftWrapper.style.width = event.offsetX + 'px';
                leftWrapper.getElementsByTagName('video')[0].style.width = wrapper.offsetWidth + 'px';
            }
        };
        var stickSplit = function (event) {
            _this.isSplitterSticked = !_this.isSplitterSticked;
            if (!_this.isSplitterSticked) {
                moveSplit(event);
            }
        };
        wrapper.onmousemove = moveSplit;
        wrapper.ontouchstart = moveSplit;
        wrapper.ontouchmove = moveSplit;
        wrapper.onclick = stickSplit;
        window.addEventListener('resize', function (event) { return _this.resizePlayers(); });
    };
    Comparator.prototype.onCanPlayTrhough = function (player) {
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
            }
            else {
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
    };
    Comparator.prototype.onEnded = function () {
        if (this.config.loop !== false) {
            this.reload();
        }
    };
    Comparator.prototype.onLoadStart = function () {
        this.container.classList.add('loaded-metadata');
        this.leftPlayer.htmlPlayer.oncanplay = undefined;
    };
    Comparator.prototype.onSeeked = function (player) {
        if (player === 'left' && !this.rightPlayer.htmlPlayer.seeking || player === 'right' && !this.leftPlayer.htmlPlayer.seeking) {
            this.play();
        }
        else {
            this.showSpinner();
            this.pause();
        }
    };
    Comparator.prototype.onSeeking = function () {
        this.showSpinner();
    };
    Comparator.prototype.onPlay = function () {
        this.play();
        var playPause = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "play-pause")[0];
        if (playPause !== undefined) {
            playPause.classList.add('playing');
            playPause.title = 'Pause';
        }
    };
    Comparator.prototype.onPause = function () {
        this.pause();
        var playPause = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "play-pause")[0];
        if (playPause !== undefined) {
            playPause.classList.remove('playing');
            playPause.title = 'Play';
        }
    };
    Comparator.prototype.onTimeUpdate = function () {
        if (!this.pidController) {
            this.setPidController();
        }
        var leftCurrentTime = this.leftPlayer.currentTime();
        var rightCurrentTime = this.rightPlayer.currentTime();
        var seekBarInner = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "seek-bar-inner")[0];
        if (seekBarInner !== undefined) {
            seekBarInner.style.width = (leftCurrentTime / this.leftPlayerData.duration * 100) + '%';
        }
        var diff = leftCurrentTime - rightCurrentTime;
        var update = this.pidController.update(diff);
        var rate = 1 + update;
        rate = rate < 0.0625 ? 0.0625 : rate > 2 ? 2 : rate;
        this.leftPlayer.playbackRate(rate);
    };
    Comparator.prototype.resizePlayers = function () {
        var wrapper = this.container.getElementsByClassName(Comparator.LIBRARY_PREFIX + "wrapper")[0];
        var wrapperWidth = wrapper.offsetWidth;
        var leftWrapper = wrapper.getElementsByClassName(Comparator.LIBRARY_PREFIX + "left-video-wrapper")[0];
        leftWrapper.style.width = (wrapperWidth / 2) + 'px';
        leftWrapper.getElementsByTagName('video')[0].style.width = wrapperWidth + 'px';
    };
    Comparator.LIBRARY_PREFIX = 'evc-';
    Comparator.PID_DIFF_OFFSET = 0.06917999999999935;
    return Comparator;
}());
exports.Comparator = Comparator;
