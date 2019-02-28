# epic-video-comparator

JS library to create a video comparator, i.e., two overlaped and syncrhonized video players each one with an independent source.

# Installation

Install the dependency into your project

```
$ npm install epic-video-comparator --save
```

# Using it as CommonJS module
```
import { Comparator } from '@epiclabs/epic-video-comparator';
...
const comparatorConfig = {
    leftUrl: 'https://video.lightflow.media/dash/standard/56c2bf64-9faf-4d81-9ad1-9c21c278806a/manifest.mpd',
    rightUrl: 'https://video.lightflow.media/hls/56c2bf64-9faf-4d81-9ad1-9c21c278806a/master.m3u8',
    mediaControls: true,
    loop: true,
};
const myComp = new Comparator(comparatorConfig, document.getElementById('comparator-container'));

```

# Using it as UMD module within ```<script>``` tag
```
<head>
    ...
    <script src="bundle/index.min.js"></script>
    ...
</head>
<body>
    ...
    <div id="comparator-container"></div>
    ...
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function () {
            var comparatorConfig = {
                leftUrl: 'https://video.lightflow.media/dash/standard/56c2bf64-9faf-4d81-9ad1-9c21c278806a/manifest.mpd',
                rightUrl: 'https://video.lightflow.media/hls/56c2bf64-9faf-4d81-9ad1-9c21c278806a/master.m3u8',
                mediaControls: true,
                loop: true,
            };
            window.myComp = new evc.Comparator(comparatorConfig, document.getElementById('comparator-container'));
        });
    </script>
    ...
</body>
```

# Development
```
$ git clone https://github.com/epiclabs-io/epic-video-comparator.git
$ cd epic-video-comparator
$ npm install
$ npm run build
```

# API

## Methods

- **new Comparator(config: IComparatorConfig, container: HTMLDivElement)**

  Creates a new instance of epic-video-comparator.
  
- **pause()**
  
  Stops playback of both videos.

- **play()**
  
  Begins playback of both videos.

- **togglePlayPause()**

  Switches the playing/pause status.

- **seek(time: number)**

  Sets both players' playback to the same time position.

- **reload()**

  Destroys and reload the epic-video-comparator.

- **toggleFullScreen()**

  Enters / exits fullscreen mode.

- **setRenditionKbps(player: 'left' | 'right', kbps: number): IRendition**

  Sets a desired rendition given as Kbps on one of the players.

- **setRenditionIndex(player: 'left' | 'right', index: number): IRendition**

  Sets a desired rendition given as index number on one of the players. The order will be the order of the array returned by *getRenditions* method.

- **getRenditions(player: 'left' | 'right'): IRendition[]**

  Retrieves the list of available renditions of one of the players.

- **togggleStats(): void**

  Shows / Hides the stats boxes.

- **updateStats(innerLeft: string, innerRight: string): void**
  
  Sets the given content to each one of the players' stats box. It will overwrite any stat given by this library as default. It is recommended to be used within a `setInterval`. 
  
- **destroy(): void**

  Removes all DOM elements and binding listeners.

  
## Object interfaces

| Name | Properties | Default value |
| ---- | ---------- |:-------------:|
| IComparatorConfig | autoplay?: boolean;<br>leftUrl: string;<br>loop?: boolean; <br>rightUrl: string;<br>mediaControls?: boolean;<br>stats?: IStatsConfig / boolean  | true <br> - <br> true <br> - <br> true <br> IStatsConfig defaults | 
| IStatsConfig | showDuration?: boolean;<br>showBitrate?: boolean;<br>showResolution?: boolean;<br>showVideoCodec?: boolean;<br>showAudioCodec?: boolean;<br>showDroppedFrames?: boolean;<br>showBuffered?: boolean;<br>showStartupTime?: boolean;<br>custom?: boolean; | true <br> true <br> true <br>  true <br>  true <br>  true <br>  true <br>  true <br>  false |
