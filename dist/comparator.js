"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var epic_video_player_1 = require("@epiclabs/epic-video-player");
var models_1 = require("./models");
var pid_controller_1 = require("./pid-controller");
var screenfull = tslib_1.__importStar(require("screenfull"));
var Comparator = /** @class */ (function () {
    function Comparator(config, container) {
        var _this = this;
        this.config = config;
        this.container = container;
        this.leftPlayerData = {};
        this.rightPlayerData = {};
        this.isSplitterSticked = true;
        this.isFullScreen = false;
        this.statsInterval = undefined;
        this.onFullscreenChange = function () {
            _this.isFullScreen = !_this.isFullScreen;
            _this.toggleFullScreenClasses();
            _this.resizePlayers();
        };
        this.resizePlayers = function () {
            var wrapper = _this.container.getElementsByClassName(Comparator.LIB_PREFIX + "wrapper")[0];
            var wrapperWidth = wrapper.offsetWidth;
            var leftWrapper = wrapper.getElementsByClassName(Comparator.LIB_PREFIX + "left-video-wrapper")[0];
            leftWrapper.style.width = (wrapperWidth / 2) + 'px';
            leftWrapper.getElementsByTagName('video')[0].style.width = wrapperWidth + 'px';
        };
        this.setInitialValues();
        this.createVideoComparator();
        this.initListeners();
        return this;
    }
    Comparator.prototype.pause = function () {
        this.leftPlayer.pause();
        this.rightPlayer.pause();
    };
    Comparator.prototype.play = function () {
        this.leftPlayer.play();
        this.rightPlayer.play();
        this.hideSpinner();
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
        this.destroy();
        this.setInitialValues();
        this.createVideoComparator();
        this.initListeners();
        if (this.isFullScreen) {
            this.toggleFullScreenClasses();
        }
    };
    Comparator.prototype.toggleFullScreen = function () {
        var _this = this;
        if (this.isFullScreen) {
            screenfull.exit().catch(function () {
                _this.isFullScreen = !_this.isFullScreen;
                _this.toggleFullScreen();
            });
        }
        else {
            screenfull.request(this.container).catch(function () {
                _this.isFullScreen = !_this.isFullScreen;
                _this.toggleFullScreen();
            });
        }
        this.resizePlayers();
    };
    Comparator.prototype.setRenditionKbps = function (player, kbps) {
        if (typeof kbps !== 'number') {
            return;
        }
        var playerObject = player === 'left' ? this.leftPlayer : player === 'right' ? this.rightPlayer : player;
        if (kbps < 0) {
            this.setAutoRendition(playerObject);
            return;
        }
        var renditions = this.getRenditions(playerObject);
        if (!renditions) {
            return;
        }
        var renditionBps = renditions[0].bitrate;
        var renditionIndex = 0;
        for (var i = 1; i < renditions.length; i++) {
            if (kbps >= Math.round(renditions[i].bitrate / 1000)) {
                renditionBps = renditions[i].bitrate;
                renditionIndex = i;
            }
        }
        this.setRendition(playerObject, renditionIndex, renditionBps);
        return renditions[renditionIndex];
    };
    Comparator.prototype.setRenditionIndex = function (player, index) {
        if (typeof index !== 'number') {
            return;
        }
        var playerObject = player === 'left' ? this.leftPlayer : player === 'right' ? this.rightPlayer : player;
        if (index < 0) {
            this.setAutoRendition(playerObject);
            return;
        }
        var renditions = this.getRenditions(playerObject);
        if (!renditions) {
            return;
        }
        if (renditions[index]) {
            this.setRendition(playerObject, index, renditions[index].bitrate);
            return renditions[index];
        }
    };
    Comparator.prototype.getRenditions = function (player) {
        if (player === 'left') {
            return this.leftPlayer.getRenditions();
        }
        else if (player === 'right') {
            return this.rightPlayer.getRenditions();
        }
        else {
            return player.getRenditions();
        }
    };
    Comparator.prototype.toggleStats = function () {
        var leftStatsContainer = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "left-stats")[0];
        leftStatsContainer.classList.toggle('hidden');
        var rightStatsContainer = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "right-stats")[0];
        rightStatsContainer.classList.toggle('hidden');
    };
    Comparator.prototype.updateStats = function (innerLeft, innerRight) {
        clearInterval(this.statsInterval);
        this.config.stats = models_1.StatsConfig.customStats();
        var leftStatsContainer = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "left-stats")[0];
        leftStatsContainer.innerHTML = innerLeft;
        var rightStatsContainer = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "right-stats")[0];
        rightStatsContainer.innerHTML = innerRight;
    };
    Comparator.prototype.destroy = function () {
        this.destroyListeners();
        this.cleanVideoComparator();
    };
    Comparator.prototype.updateStatsBox = function (player, stats, rendition) {
        if (this.config.stats === false || this.config.stats.custom === true) {
            return;
        }
        var inner = '';
        var statsConfig = this.config.stats;
        if (statsConfig.showDuration !== false && stats && stats.duration > 0) {
            inner += "<p><b>Duration:</b> " + Math.round(stats.duration) + " s</p>";
        }
        if (statsConfig.showDroppedFrames !== false && stats && stats.droppedFrames >= 0) {
            inner += "<p><b>Dropped frames:</b> " + stats.droppedFrames + "</p>";
        }
        if (statsConfig.showBuffered !== false && stats && stats.buffered !== undefined) {
            inner += "<p><b>Buffered:</b> " + this.getTotalBuffer(stats.buffered) + " s</p>";
        }
        if (statsConfig.showStartupTime !== false && stats && stats.loadTime > 0) {
            inner += "<p><b>Startup time:</b> " + Math.round(stats.loadTime * 100) / 100 + " s</p>";
        }
        if (statsConfig.showBitrate !== false && rendition && rendition.bitrate > 0) {
            inner += "<p><b>Bitrate:</b> " + Math.round(rendition.bitrate / 1000) + " Kbps</p>";
        }
        if (statsConfig.showResolution !== false && rendition && rendition.width > 0 && rendition.height > 0) {
            inner += "<p><b>Resolution:</b> " + rendition.width + "x" + rendition.height + "</p>";
        }
        if (statsConfig.showVideoCodec !== false && rendition && !!rendition.videoCodec) {
            inner += "<p><b>Video codec:</b> " + rendition.videoCodec + "</p>";
        }
        if (statsConfig.showAudioCodec !== false && rendition && !!rendition.audioCodec) {
            inner += "<p><b>Audio codec:</b> " + rendition.audioCodec + "</p>";
        }
        var statsContainer = this.container.getElementsByClassName("" + Comparator.LIB_PREFIX + player + "-stats")[0];
        statsContainer.innerHTML = inner;
    };
    Comparator.prototype.getTotalBuffer = function (buffered) {
        var res = 0;
        if (buffered !== undefined && buffered.length > 0) {
            for (var _i = 0, buffered_1 = buffered; _i < buffered_1.length; _i++) {
                var buffer = buffered_1[_i];
                res += (buffer.end - buffer.start);
            }
        }
        return Math.round(res);
    };
    Comparator.prototype.cleanVideoComparator = function () {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };
    Comparator.prototype.seekInner = function ($event) {
        var seekBar = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "seek-bar")[0];
        var seekBarInner = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "seek-bar-inner")[0];
        var time = $event.offsetX * this.leftPlayerData.duration / seekBar.offsetWidth;
        seekBarInner.style.width = (time / this.leftPlayerData.duration * 100) + '%';
        this.seek(time);
    };
    Comparator.prototype.createVideoComparator = function () {
        this.container.classList.add(Comparator.LIB_PREFIX + "container");
        this.fullScreenWrapper = document.createElement('div');
        this.fullScreenWrapper.className = Comparator.LIB_PREFIX + "full-screen-wrapper";
        this.container.appendChild(this.fullScreenWrapper);
        var wrapper = document.createElement('div');
        wrapper.className = Comparator.LIB_PREFIX + "wrapper";
        var leftVideoWrapper = this.createVideoPlayer('left');
        var rightVideoWrapper = this.createVideoPlayer('right');
        wrapper.appendChild(leftVideoWrapper);
        wrapper.appendChild(rightVideoWrapper);
        this.fullScreenWrapper.appendChild(this.createLoadingSpinner());
        this.fullScreenWrapper.appendChild(wrapper);
        this.fullScreenWrapper.appendChild(this.createMediaControls());
        this.leftPlayer = epic_video_player_1.newPlayer(this.config.leftUrl, leftVideoWrapper.getElementsByTagName('video')[0], this.leftPlayerData.config);
        this.rightPlayer = epic_video_player_1.newPlayer(this.config.rightUrl, rightVideoWrapper.getElementsByTagName('video')[0], this.rightPlayerData.config);
    };
    Comparator.prototype.createVideoPlayer = function (player) {
        var videoWrapper = document.createElement('div');
        videoWrapper.className = "" + Comparator.LIB_PREFIX + player + "-video-wrapper";
        var videoElement = document.createElement('video');
        videoElement.className = Comparator.LIB_PREFIX + "video";
        videoElement.muted = true;
        videoElement.autoplay = false;
        videoWrapper.appendChild(videoElement);
        videoWrapper.appendChild(this.createStatsBox(player));
        return videoWrapper;
    };
    Comparator.prototype.createStatsBox = function (player) {
        var stats = document.createElement('div');
        stats.className = "" + Comparator.LIB_PREFIX + player + "-stats";
        stats.classList.add('hidden');
        return stats;
    };
    Comparator.prototype.createLoadingSpinner = function () {
        var loadingSpiner = document.createElement('div');
        loadingSpiner.className = Comparator.LIB_PREFIX + "loading-spinner";
        loadingSpiner.innerHTML = '<div><div></div></div>';
        return loadingSpiner;
    };
    Comparator.prototype.createMediaControls = function () {
        var _this = this;
        if (this.config.mediaControls === false) {
            return;
        }
        var controls = document.createElement('div');
        controls.className = Comparator.LIB_PREFIX + "media-controls";
        // play pause button
        var playPause = document.createElement('div');
        playPause.className = Comparator.LIB_PREFIX + "play-pause";
        playPause.onclick = function () { return _this.togglePlayPause(); };
        controls.appendChild(playPause);
        // reload button
        var reload = document.createElement('div');
        reload.className = Comparator.LIB_PREFIX + "reload";
        reload.title = 'Reload';
        reload.onclick = function () { return _this.reload(); };
        reload.appendChild(document.createElement('div'));
        controls.appendChild(reload);
        // seekbar
        var seekBar = document.createElement('div');
        seekBar.className = Comparator.LIB_PREFIX + "seek-bar";
        seekBar.onclick = function ($event) { return _this.seekInner($event); };
        var seekBarInner = document.createElement('div');
        seekBarInner.className = Comparator.LIB_PREFIX + "seek-bar-inner";
        seekBar.appendChild(seekBarInner);
        controls.appendChild(seekBar);
        // quality selector popup
        var qualitySelectorPopupWrapper = document.createElement('div');
        qualitySelectorPopupWrapper.className = Comparator.LIB_PREFIX + "quality-selector-popup-wrapper";
        var qualitySelectorPopup = document.createElement('div');
        qualitySelectorPopup.className = Comparator.LIB_PREFIX + "quality-selector-popup";
        qualitySelectorPopupWrapper.appendChild(qualitySelectorPopup);
        this.container.getElementsByClassName(Comparator.LIB_PREFIX + "wrapper")[0].appendChild(qualitySelectorPopupWrapper);
        // quality selector button
        var qualitySelectorIcon = document.createElement('div');
        qualitySelectorIcon.className = Comparator.LIB_PREFIX + "quality-icon";
        qualitySelectorIcon.title = 'Quality selector';
        qualitySelectorIcon.onclick = function ($event) { return _this.onQualityIconClick($event, qualitySelectorIcon, qualitySelectorPopup); };
        controls.appendChild(qualitySelectorIcon);
        // fullscreen button
        var fullScreen = document.createElement('div');
        fullScreen.className = Comparator.LIB_PREFIX + "full-screen";
        fullScreen.title = 'Full screen';
        fullScreen.onclick = function () { return _this.toggleFullScreen(); };
        controls.appendChild(fullScreen);
        return controls;
    };
    Comparator.prototype.onQualityIconClick = function ($event, icon, popup) {
        popup.classList.toggle('visible');
        icon.classList.toggle('active');
    };
    Comparator.prototype.setInitialValues = function () {
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
            this.config.stats = models_1.StatsConfig.defaultStats();
        }
        else if (this.config.stats.custom === true) {
            this.config.stats = models_1.StatsConfig.customStats();
        }
    };
    Comparator.prototype.setPidController = function () {
        var target = this.leftPlayer.playerType === this.rightPlayer.playerType ? 0 :
            Comparator.PID_DIFF_OFFSET;
        this.pidController = new pid_controller_1.PidController(0.5, 0.1, 0.1, target);
    };
    Comparator.prototype.showSpinner = function () {
        this.container.getElementsByClassName(Comparator.LIB_PREFIX + "loading-spinner")[0].classList.remove('hidden');
    };
    Comparator.prototype.hideSpinner = function () {
        this.container.getElementsByClassName(Comparator.LIB_PREFIX + "loading-spinner")[0].classList.add('hidden');
    };
    Comparator.prototype.populateQualitySelector = function () {
        var popup = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "quality-selector-popup")[0];
        while (popup.firstChild) {
            popup.removeChild(popup.firstChild);
        }
        this.populateQualitySelectorSide(this.leftPlayer, this.leftPlayerData, popup);
        this.populateQualitySelectorSide(this.rightPlayer, this.rightPlayerData, popup);
    };
    Comparator.prototype.populateQualitySelectorSide = function (player, data, popup) {
        var _this = this;
        var _a = [player.getRenditions(), player.getCurrentRendition()], renditions = _a[0], currentRendition = _a[1];
        var sideElementList = document.createElement('ul');
        if (!renditions) {
            return;
        }
        if (data.config.initialRenditionIndex === Comparator.DEFAULT_QUALITY_INDEX &&
            data.config.initialRenditionKbps === Comparator.DEFAULT_QUALITY_KBPS) {
            data.config.initialRenditionIndex = renditions.length - 1;
            data.config.initialRenditionKbps = renditions[renditions.length - 1].bitrate / 1000;
        }
        var listItemAuto = document.createElement('li');
        listItemAuto.innerHTML = (data.config.initialRenditionIndex === -1 ? '> ' : '') + "Auto";
        listItemAuto.onclick = function () { return _this.setAutoRendition(player); };
        sideElementList.appendChild(listItemAuto);
        var _loop_1 = function (i) {
            var listItem = document.createElement('li');
            var selected = data.config.initialRenditionIndex === i ? '> ' : '';
            var _a = [renditions[i].width, renditions[i].height, Math.round(renditions[i].bitrate / 1000)], width = _a[0], height = _a[1], kbps = _a[2];
            listItem.innerHTML = "" + selected + width + "x" + height + " (" + kbps + " kbps)";
            listItem.className = currentRendition && renditions[i].bitrate === currentRendition.bitrate ? 'current' : '';
            listItem.onclick = function () { return _this.setRendition(player, i, renditions[i].bitrate); };
            sideElementList.appendChild(listItem);
        };
        for (var i = 0; i < renditions.length; i++) {
            _loop_1(i);
        }
        var sideElement = document.createElement('div');
        var side = player === this.leftPlayer ? 'LEFT' : 'RIGHT';
        sideElement.innerHTML = "<p><b>" + side + "</b></p>";
        sideElement.appendChild(sideElementList);
        popup.appendChild(sideElement);
    };
    Comparator.prototype.setRendition = function (player, index, bitrate) {
        player.config.initialRenditionIndex = index;
        player.config.initialRenditionKbps = bitrate >= 0 ? Math.round(bitrate / 1000) + 1 : -1;
        if (player === this.leftPlayer) {
            this.leftPlayerData.config.initialRenditionIndex = index;
        }
        else {
            this.rightPlayerData.config.initialRenditionIndex = index;
        }
        this.reload();
    };
    Comparator.prototype.setAutoRendition = function (player) {
        this.setRendition(player, -1, -1);
    };
    /**
     * Event listeners
     */
    Comparator.prototype.initListeners = function () {
        var _this = this;
        screenfull.on('change', this.onFullscreenChange);
        this.leftPlayer.htmlPlayer.oncanplaythrough = function () { return _this.onCanPlayThrough('left'); };
        this.leftPlayer.htmlPlayer.onended = function () { return _this.onEnded(); };
        this.leftPlayer.htmlPlayer.onloadstart = function () { return _this.onLoadStart(); };
        this.leftPlayer.htmlPlayer.onpause = function () { return _this.onPause(); };
        this.leftPlayer.htmlPlayer.onplay = function () { return _this.onPlay(); };
        this.leftPlayer.htmlPlayer.onseeked = function () { return _this.onSeeked('left'); };
        this.leftPlayer.htmlPlayer.onseeking = function () { return _this.onSeeking(); };
        this.leftPlayer.htmlPlayer.ontimeupdate = function () { return _this.onTimeUpdate(); };
        this.rightPlayer.htmlPlayer.oncanplaythrough = function () { return _this.onCanPlayThrough('right'); };
        this.rightPlayer.htmlPlayer.onended = function () { return _this.onEnded(); };
        this.leftPlayer.htmlPlayer.onpause = function () { return _this.onPause(); };
        this.leftPlayer.htmlPlayer.onplay = function () { return _this.onPlay(); };
        this.rightPlayer.htmlPlayer.onseeked = function () { return _this.onSeeked('right'); };
        this.rightPlayer.htmlPlayer.onseeking = function () { return _this.onSeeking(); };
        var wrapper = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "wrapper")[0];
        var popupWrapper = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "quality-selector-popup-wrapper")[0];
        var leftStatsWrappers = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "left-stats")[0];
        var rightStatsWrappers = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "right-stats")[0];
        var moveSplit = function (event) {
            if (!_this.isSplitterSticked) {
                var leftWrapper = wrapper.getElementsByClassName(Comparator.LIB_PREFIX + "left-video-wrapper")[0];
                leftWrapper.style.width = event.offsetX + 'px';
                leftWrapper.getElementsByTagName('video')[0].style.width = wrapper.offsetWidth + 'px';
            }
        };
        var stickSplit = function (event) {
            _this.isSplitterSticked = !_this.isSplitterSticked;
            if (!_this.isSplitterSticked) {
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
            this.statsInterval = setInterval(function () {
                _this.updateStatsBox('left', _this.leftPlayer.getStats(), _this.leftPlayer.getCurrentRendition());
                _this.updateStatsBox('right', _this.rightPlayer.getStats(), _this.rightPlayer.getCurrentRendition());
            }, 1500);
        }
    };
    Comparator.prototype.destroyListeners = function () {
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
        var wrapper = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "wrapper")[0];
        wrapper.onmousemove = undefined;
        wrapper.ontouchstart = undefined;
        wrapper.ontouchmove = undefined;
        wrapper.onclick = undefined;
        window.removeEventListener('resize', this.resizePlayers);
    };
    Comparator.prototype.onCanPlayThrough = function (player) {
        if (!this.leftPlayerData.isInitialized || !this.rightPlayerData.isInitialized) {
            if (player === 'left') {
                this.leftPlayerData.isInitialized = true;
                this.leftPlayerData.duration = this.leftPlayer.htmlPlayer.duration;
                this.leftPlayer.htmlPlayer.oncanplay = undefined;
                if (this.rightPlayerData.isInitialized) {
                    this.onCanPlayThroughBoth();
                }
            }
            else {
                this.rightPlayerData.isInitialized = true;
                this.rightPlayerData.duration = this.leftPlayer.htmlPlayer.duration;
                this.rightPlayer.htmlPlayer.oncanplay = undefined;
                if (this.leftPlayerData.isInitialized) {
                    this.onCanPlayThroughBoth();
                }
            }
        }
    };
    Comparator.prototype.onCanPlayThroughBoth = function () {
        this.hideSpinner();
        this.resizePlayers();
        this.populateQualitySelector();
        this.updatePlayersData();
        if (this.config.autoplay !== false) {
            this.play();
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
            this.pause();
            this.showSpinner();
        }
    };
    Comparator.prototype.onSeeking = function () {
        this.pause();
        this.showSpinner();
    };
    Comparator.prototype.onPlay = function () {
        this.play();
        var playPause = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "play-pause")[0];
        if (playPause !== undefined) {
            playPause.classList.add('playing');
            playPause.title = 'Pause';
        }
    };
    Comparator.prototype.onPause = function () {
        this.pause();
        var playPause = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "play-pause")[0];
        if (playPause !== undefined) {
            playPause.classList.remove('playing');
            playPause.title = 'Play';
        }
    };
    Comparator.prototype.onTimeUpdate = function () {
        if (!this.pidController) {
            this.setPidController();
        }
        if (this.updatePlayersData()) {
            this.populateQualitySelector();
        }
        var leftCurrentTime = this.leftPlayer.currentTime();
        var rightCurrentTime = this.rightPlayer.currentTime();
        var seekBarInner = this.container.getElementsByClassName(Comparator.LIB_PREFIX + "seek-bar-inner")[0];
        if (seekBarInner !== undefined) {
            seekBarInner.style.width = (leftCurrentTime / this.leftPlayerData.duration * 100) + '%';
        }
        var diff = leftCurrentTime - rightCurrentTime;
        var update = this.pidController.update(diff);
        var rate = 1 + update;
        rate = rate < 0.0625 ? 0.0625 : rate > 2 ? 2 : rate;
        this.leftPlayer.playbackRate(rate);
    };
    Comparator.prototype.updatePlayersData = function () {
        var lChanged = this.updatePlayerData(this.leftPlayer, this.leftPlayerData);
        var rChanged = this.updatePlayerData(this.rightPlayer, this.rightPlayerData);
        return lChanged || rChanged;
    };
    // returns true if any value has changed
    Comparator.prototype.updatePlayerData = function (player, data) {
        var changed = false;
        var currentRendition = player.getCurrentRendition();
        if (currentRendition) {
            changed = data.currentBitrate !== currentRendition.bitrate ? true : changed;
            data.currentBitrate = currentRendition.bitrate;
            changed = data.currentWidth !== currentRendition.width ? true : changed;
            data.currentWidth = currentRendition.width;
            changed = data.currentHeight !== currentRendition.height ? true : changed;
            data.currentHeight = currentRendition.height;
        }
        var renditions = player.getRenditions();
        changed = this.areEqualRenditions(renditions, data.renditions) === false ? true : changed;
        data.renditions = renditions;
        return changed;
    };
    Comparator.prototype.areEqualRenditions = function (rend1, rend2) {
        if (rend1 === undefined || rend2 === undefined || rend1.length !== rend2.length) {
            return false;
        }
        if (rend1.length > 0 && rend2.length > 0) {
            for (var i = 0; i < rend1.length; i++) {
                if (rend1[i].bitrate !== rend2[i].bitrate && rend1[i].level !== rend2[i].level && rend1[i].height !== rend2[i].height) {
                    return false;
                }
            }
        }
        return true;
    };
    Comparator.prototype.toggleFullScreenClasses = function () {
        this.container.getElementsByClassName(Comparator.LIB_PREFIX + "wrapper")[0].classList.toggle('full-screen-mode');
        this.container.getElementsByClassName(Comparator.LIB_PREFIX + "media-controls")[0].classList.toggle('full-screen-mode');
    };
    Comparator.LIB_PREFIX = 'evc-';
    Comparator.PID_DIFF_OFFSET = 0.06917999999999935;
    Comparator.DEFAULT_QUALITY_INDEX = 9999;
    Comparator.DEFAULT_QUALITY_KBPS = 999999;
    return Comparator;
}());
exports.Comparator = Comparator;
