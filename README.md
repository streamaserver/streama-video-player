# streama-video-player
A standalone version of the new video player used in the Streama project and the Streama mobile app.

### The player UI 
![UIExample1](example/Screen%20Shot%202017-06-23%20at%2023.03.49.png)

### Subtitle & Subtitle Size UI 
![UIExample2](example/Screen%20Shot%202017-06-23%20at%2023.03.55.png)

### For TV-Shows: Episode UI 
![UIExample3](example/Screen%20Shot%202017-06-23%20at%2023.04.02.png)

# Installation (using bower)
`bower install streama-video-player --save`  
This command installs the streama-video-player as well as all dependencies


# Usage
### Load dependencies
```html
    <!-- LOAD ALL JS DEPENDENCIES -->
    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-sanitize/angular-sanitize.js"></script>
    <script src="bower_components/angular-translate/angular-translate.js"></script>
    <script src="bower_components/jquery/dist/jquery.js"></script>
    <script src="bower_components/jquery-mousewheel/jquery.mousewheel.js"></script>
    <script src="bower_components/mousetrap/mousetrap.js"></script>
    <script src="bower_components/angular-local-storage/dist/angular-local-storage.js"></script>
    <script src="bower_components/angularjs-slider/dist/rzslider.min.js"></script>
    <script src="bower_components/streama-i18n/dist/streama-i18n.min.js"></script>
    
    <!-- LOAD ALL CSS DEPENDENCIES -->
    <link rel="stylesheet" href="bower_components/Ionicons/css/ionicons.css">
    <link rel="stylesheet" href="bower_components/angularjs-slider/dist/rzslider.css">
```

### Load Streama-video-player
```html
    
    <!-- LOAD STREAMA_VIDEO_PLAYER JS -->
    <script src="bower_components/streama-video-player/dist/streama-video-player.js"></script>
    
    <!-- LOAD STREAMA_VIDEO_PLAYER CSS -->
    <link rel="stylesheet" href="bower_components/streama-video-player/dist/streama-video-player.css">
```

### Directive usage
```html
<script>
	angular.module('yourModule', ['streama.videoPlayer']).run(function($rootScope){
		$rootScope.videoOptions = {
			videoSrc: 'http://techslides.com/demos/sample-videos/small.mp4'
		}
	});
</script>


<div ng-app="yourModule">
    <streama-video-player options="videoOptions"></streama-video-player>
</div>
``` 

# Options
```javascript
// default options
$scope.videoOptions = {
	customStartingTime: 0,
	rememberVolumeSetting: true,
	videoMetaTitle: '',
	videoMetaSubtitle: '',
	videoMetaDescription: '',
	videoSrc: '',
	videoType: '',
	videoTrack: '',
	videoOverlayEnabled: true,
	showEpisodeBrowser: false,
	showNextButton: false,
	showSocketSession: true,
	episodeList: [],
	selectedEpisodes: [],
	currentEpisode: {},
	isExternalLink: false,
	onSocketSessionCreate: angular.noop,
	onTimeChange: angular.noop,
	onError: angular.noop,
	onPlay: angular.noop,
	onPause: angular.noop,
	onClose: angular.noop,
	onNext: angular.noop,
	onVideoClick: angular.noop
};


// Example options for TV-Show Episode 
$scope.videoOptions = {
	videoSrc: 'https://streama.club/file/serve/1497.mkv',
	isExternalLink: true,
	episodeList: {
		1: [   // wrapper for season, number indicates season number
			{
				id: 1,  //unique ID for this piece of data
				name: 'Pilot', 
				season_number: 1, 
				episode_number:1, 
				episodeString: 's01e01', 
				still_path: 'https://image.tmdb.org/t/p/original/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg', 
				overview: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.', 
				videoDuration: 1320  //in seconds
			}
		// and more episodes...
    ]
  },
	showEpisodeBrowser: true,
	currentEpisode : {
		episode: 1,
		season: 1,
		id: 1
	},
  subtitles: [
		{
			"id": 1561, 
			"src": "/example/sub-de.vtt", 
			"subtitleLabel": "Deutsch", 
			"subtitleSrcLang": "de", 
			"contentType": "application/x-subrip"
		}
		// and more subtitles
  ],
  currentSubtitle: 1562  // unique subtitle ID matching one of the ones in the subtitles list
}



```


# FAQs
- Make sure your http to the video has Access-Control-Allow-Origin enabled
- Make sure the videos you use are HTML5 compatible

