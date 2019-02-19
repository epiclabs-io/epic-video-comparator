"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StatsConfig = /** @class */ (function () {
    function StatsConfig() {
        this.showDuration = true;
        this.showBitrate = true;
        this.showResolution = true;
        this.showVideoCodec = true;
        this.showAudioCodec = true;
        this.showDroppedFrames = true;
        this.showBuffered = true;
        this.showStartupTime = true;
        this.custom = false;
    }
    StatsConfig.customStats = function () {
        var statsConfig = new StatsConfig();
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
    };
    StatsConfig.defaultStats = function () {
        return new StatsConfig();
    };
    return StatsConfig;
}());
exports.StatsConfig = StatsConfig;
