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
  
## Object interfaces

| Name | Properties |
| ---- | ---------- |
| IPlayerConfig | TBD<br>TBD |
