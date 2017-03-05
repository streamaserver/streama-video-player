# streama-video-player
Extracted streama video player


# Usage
```html
	  <script src="../bower_components/angular/angular.js"></script>
    <script src="../bower_components/angular-translate/angular-translate.js"></script>
    <script src="../bower_components/jquery/dist/jquery.js"></script>
    <script src="../bower_components/jquery-mousewheel/jquery.mousewheel.js"></script>
    <script src="../bower_components/mousetrap/mousetrap.js"></script>
    <script src="../bower_components/angular-local-storage/dist/angular-local-storage.js"></script>
    <script src="../bower_components/angularjs-slider/dist/rzslider.min.js"></script>
    <script src="../bower_components/streama-i18n/dist/streama-i18n.min.js"></script>
    <script src="../dist/streama-video-player.js"></script>
    
		<link rel="stylesheet" href="../bower_components/Ionicons/css/ionicons.css">
		<link rel="stylesheet" href="../bower_components/angularjs-slider/dist/rzslider.css">
		<link rel="stylesheet" href="../dist/streama-video-player.css">
```

```javascript
angular.module('yourModule', ['streama.videoPlayer'])


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

```

```html
<streama-video-player
		options="videoOptions">
</streama-video-player>

``` 