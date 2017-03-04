# streama-video-player
Extracted streama video player


# Usage
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