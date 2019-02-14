# epic-video-comparator

JS library to create a video comparator, i.e., two overlaped and syncrhonized video players each one with an independent source.

# Installation

Install the dependency into your project

```
$ npm install epic-video-comparator --save
```

# Using it as CommonJS module
```
import { XX } from '@epiclabs/epic-video-comparator';

...

TBD
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
    TBD
    ...
    TBD
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

- **newComparator(TBD)**

  Creates a new instance of epic-video-comparator.
  
- **pause()**
  
  Stops playback of both videos.

- **play()**
  
  Begins playback of both videos.

- **togglePlayPause()**

  Switch the playing/pause status.

- **seek(time: number)**

  Set both players' playback to the same time position.

- **reload()**

  Destroy and reload the epic-video-comparator.

- **fullScreen()**

  Enter fullscreen mode.

- **setRenditionKbps(player: 'left' | 'right', kbps: number): IRendition**

  Set a desired rendition given as Kbps on one of the players.

- **setRenditionIndex(player: 'left' | 'right', index: number): IRendition**

  Set a desired rendition given as index number on one of the players. The order will be the order of the array returned by *getRenditions* method.

- **getRenditions(player: 'left' | 'right'): IRendition[]**

  Retrieve the list of available renditions of one of the players.

  
## Object interfaces

| Name | Properties |
| ---- | ---------- |
| IPlayerConfig | TBD<br>TBD |
