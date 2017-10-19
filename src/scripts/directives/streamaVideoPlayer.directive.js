'use strict';

angular.module('streama.videoPlayer').directive('streamaVideoPlayer', [
  'localStorageService', '$timeout', '$http', 'streamaVideoPlayerService', '$filter',
  function (localStorageService, $timeout, $http, streamaVideoPlayerService, $filter) {

    return {
      restrict: 'AE',
      templateUrl: 'streama-video-player.touch.html',
      scope: {
        options: '='
      },

      link: function ($scope, $elem, $attrs) {
				$scope.options = streamaVideoPlayerService.initOptions($scope.options);
				if(!$scope.options){
					console.error('There was an error initializing the player. Please refer to the error log.');
					return;
				}
				var video;
        var controlDisplayTimeout;
        var overlayTimeout;
        var volumeChangeTimeout;
        var currentTimeChangeTimeout;
				var currEpisode = null;
        var skipIntro = true;         //Userflag intro should be skipped
        var minimizeOnOutro = true;   //Userflag skip to next episode on outro
				var videoSrc = $scope.options.videoSrc.toString();
				var isAutoScrubberUpdate = true;


				$scope.changeEpisode = changeEpisode;
				$scope.selectSubtitle = selectSubtitle;
				$scope.showControls = showControls;
				$scope.toggleSelectEpisodes = toggleSelectEpisodes;
				$scope.createNewPlayerSession = createNewPlayerSession;
        $scope.toggleTextTrack = toggleTextTrack;
        $scope.playerVolumeToggle = playerVolumeToggle;
				$scope.play = play;
				$scope.togglePlay = togglePlay;
				$scope.pause = pause;
				$scope.closeVideo = closeVideo;
				$scope.hideMobileControls = hideMobileControls;
				$scope.toggleMobileOverlayBox = toggleMobileOverlayBox;
				$scope.clickVideo = clickVideo;
				$scope.fullScreen = toggleFullScreen;
				$scope.changeSubtitleSize = changeSubtitleSize;
				$scope.next = $scope.options.onNext;
				$scope.isMobileControlsVisible = true;
				$scope.isInitialized = false;
				$scope.loading = true;
				$scope.initialPlay = false;


				$scope.mobileOverlayBox = {
					isVisble: false,
					type: ''
				};

				$scope.verticalSlider1 = {
					value: 5,
					options: {
						floor: 0,
						ceil: 10,
						vertical: true
					}
				};

				if(!$scope.options.isExternalLink){
					$http.head(videoSrc)
						.success(function(){
							initDirective();
						})
						.error(function(data, status) {
							if(status == 406){
								$scope.options.onError('FILE_IN_FS_NOT_FOUND');
							}
						});
				}else{
					initDirective();
				}

				function initDirective() {
					$scope.isInitialized = true;

					$elem.addClass('nocursor');

					if(!$scope.options.isTouch){
						initMouseWheel();
					}
					streamaVideoPlayerService.initMousetrap(video, $scope, skipActivated, changeVolume);
					initExternalTriggers();
					initIsMobile();
					$scope.$on('$destroy', onDirectiveDestroy);
					$scope.$on('$stateChangeSuccess', onStateChangeSuccess);
					generateVolumeScrubberOptions();

					$timeout(function () {
						var $video = $elem.find('video');
						$video.bind("contextmenu",function(){return false;});
						video = $video[0];
						video.oncanplay = onVideoCanPlay;
						video.onwaiting = onVideoWaiting;
						video.onplaying = onVideoPlaying;
						video.onerror = onVideoError;
						video.ontimeupdate = onVideoTimeupdate;
						video.addEventListener('ended', onVideoEnded);
						selectSubtitle(getCurrentSubtitleTrack());
					});
				}


				function changeEpisode(episode) {
					$scope.options.onEpisodeChange(episode);
				}

				function selectSubtitle(subtitle) {
					_.forEach(video.textTracks, function(textTrack, key) {
						if(subtitle && textTrack.id === 'subtitle-' + subtitle.id) {
							textTrack.mode = 'showing';
						}
						else{
							textTrack.mode = 'hidden';
						}

					});

					$scope.options.onSubtitleSelect(subtitle);
					$scope.selectedSubtitleId = _.get(subtitle, 'id');
					localStorageService.set('selectedSubtitleLanguage', _.get(subtitle, 'subtitleSrcLang'));
				}

				function getCurrentSubtitleTrack() {
					return _.find($scope.options.subtitles, {id: $scope.options.currentSubtitle});
				}

        //$scope.controlsVisible = true;
        function showControls() {
          $elem.removeClass('nocursor');
          $timeout.cancel(controlDisplayTimeout);
          $timeout.cancel(overlayTimeout);
          $scope.controlsVisible = true;
          $scope.overlayVisible = false;


          controlDisplayTimeout = $timeout(function(){
            $scope.controlsVisible = false;

            if(!$scope.playing){
              overlayTimeout = $timeout(function () {
                if(!$scope.playing){
                  $scope.overlayVisible = true;
                }
              }, 5000);
            }else{
              $elem.addClass('nocursor');
            }

          }, 1000);
        }

				function generateScrupperOoptions(videoDuration) {
					$scope.scrubber = {
						model: 0,
						options: {
							floor: 0,
							ceil: videoDuration,
							step: 1,
							hideLimitLabels: true,
							hidePointerLabels: true,
							showSelectionBar: true,
							// translate: function(value) {
							// 	return $filter('streamaVideoTime')(value);
							// },
							onStart: function () {
								isAutoScrubberUpdate = false;
							},
							// onChange: function(id) {
							// },
							onEnd: function(sliderId, modelValue, highValue, pointerType) {
								video.currentTime = modelValue;
								$scope.scrubber.model = modelValue;
								isAutoScrubberUpdate = true;
								// $scope.options.onTimeChange(slider, $scope.videoDuration);
							}
						}
					};
				}

				function generateVolumeScrubberOptions() {
					$scope.volumeLevel = localStorageService.get('volumeLevel') || 5;
					$scope.volume = {
						options: {
							floor: 0,
							ceil: 10,
							step: 0.1,
							// precision: 1,
							hideLimitLabels: true,
							hidePointerLabels: true,
							showSelectionBar: true,
							vertical: true,
							onChange: function (sliderId, modelValue, highValue, pointerType) {
								setVolume(modelValue);
							}
						// slide: function (e, slider) {
						// 	setVolume(slider);
						// 	angular.element('#playerVolumeSlider .ui-slider-handle').blur();
						// }
						}
					};
				}

				function closeVideo() {

					//If full screen is enabled, it will be canceled.
					if ($scope.isFullScreen == true) {
						$scope.fullScreen();
					}

					onDirectiveDestroy();
					$scope.options.onClose();
				}

				function clickVideo() {
					$scope.isMobileControlsVisible = true;
					$scope.options.onVideoClick();
				}
				function hideMobileControls() {
					$scope.isMobileControlsVisible = false;
				}
				function toggleMobileOverlayBox(type) {
					$scope.mobileOverlayBox.isVisble = !$scope.mobileOverlayBox.isVisble;
					$scope.mobileOverlayBox.type = type;
					togglePlay();
				}

				function changeSubtitleSize(subtitleSize) {
					$scope.options.subtitleSize = subtitleSize;
					localStorageService.set('subtitleSize', subtitleSize);
				}

				function toggleFullScreen() {
					var docElm;
					var docElmClose = document;
					if($scope.isMobile){
						docElm = video;
					}else{
						docElm = document.documentElement;
					}
					var isFullScreen = window.innerHeight == screen.height;
					if( !isFullScreen) {
						$scope.isFullScreen = true;
						if (docElm.requestFullscreen) {
							docElm.requestFullscreen();
						}
						else if (docElm.mozRequestFullScreen) {
							docElm.mozRequestFullScreen();
						}
						else if (docElm.webkitRequestFullScreen) {
							docElm.webkitRequestFullScreen();
						}
						else if (docElm.msRequestFullscreen) {
							docElm.msRequestFullscreen();
						}
					}

					else{
						$scope.isFullScreen = false;
						if (docElmClose.exitFullscreen) {
							docElmClose.exitFullscreen();
						}
						else if (docElmClose.mozCancelFullScreen) {
							docElmClose.mozCancelFullScreen();
						}
						else if (docElmClose.webkitExitFullscreen) {
							docElmClose.webkitExitFullscreen();
						}
						else if (docElmClose.msExitFullscreen) {
							docElmClose.msExitFullscreen();
						}
					}
				}

				function setVolume(value) {
					var volume = value / 10;
					video.volume = volume;
					if($scope.options.rememberVolumeSetting){
						localStorageService.set('volumeLevel', value);
					}
				}

				function playerVolumeToggle() {
					if($scope.volumeLevel == 0){
						$scope.volumeLevel = 5;
					}else{
						$scope.volumeLevel = 0;
					}
				}

        function initExternalTriggers() {
					$scope.$on('triggerVideoPlay', function (e, data) {
						$scope.play(data);
					});
					$scope.$on('triggerVideoPause', function (e, data) {
						$scope.pause(data);
					});
					$scope.$on('triggerVideoToggle', function (e, data) {
						if ($scope.playing) {
							$scope.pause(data);
						} else {
							$scope.play(data);
						}
					});
					$scope.$on('triggerVideoTimeChange', function (e, data) {
						video.currentTime = data.currentPlayerTime;
						$scope.scrubber.model = data.currentPlayerTime;
					});
				}

				function onStateChangeSuccess(e, toState) {
					if(toState.name != "player"){
						//If full screen is enabled, it will be canceled.
						if ($scope.isFullScreen = true) {
							$scope.fullScreen();
						}
					}
				}

				function onDirectiveDestroy() {

					//Disable these shortcut keys for other pages. They are re-initialized when the user opens the player again.
					Mousetrap.reset();

					console.log("destroy");
					video.pause();
					video.src = '';
					$elem.find('video').children('source').prop('src', '');
					$elem.find('video').remove().length = 0;
				}

				function onVideoTimeupdate(event){
					if(!isAutoScrubberUpdate){
						return;
					}
					$scope.scrubber.model = video.currentTime;
					$scope.$broadcast('rzSliderForceRender');
					$scope.$apply();
					if(skipIntro)
					{
						if(currEpisode == null)
						{
							currEpisode = $scope.options.currentEpisode;
						}
						if(currEpisode.intro_start < this.currentTime && this.currentTime < currEpisode.intro_end)
						{
							video.currentTime = currEpisode.intro_end;
						}
					}
				}

				function onVideoEnded() {
					if($scope.options.showNextButton){
						$scope.options.onNext();
					}
				}

				function onVideoError(){
					if(!video.duration && !$scope.initialPlay){
						console.error('Video Playback Error');
						$scope.options.onError();
					}
				}

				function onVideoPlaying() {
					$scope.loading = false;
				}

				function onVideoCanPlay() {
					if(!$scope.initialPlay){
						$scope.canplay = true;
						console.log('%c onVideoCanPlay', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;');
						$scope.loading = false;
						if(!$scope.isMobile){
							$scope.play();
						}else{
							$scope.pause();
						}
						$scope.videoDuration = video.duration;
						generateScrupperOoptions(video.duration);

						video.currentTime = $scope.options.customStartingTime || 0;
						$scope.scrubber.model = video.currentTime || 0;
						$scope.initialPlay = true;
						if($scope.options.videoTrack){
							video.textTracks[0].mode = "hidden";
						}
					}
				}

				function onVideoWaiting() {
					$scope.loading = true;
				}

				function toggleSelectEpisodes(episodes) {
					$scope.options.selectedEpisodes = episodes;
				}

				function pause(socketData) {
					video.pause();
					$scope.playing = false;
					$scope.options.onPause(video, socketData);
				}

				function togglePlay() {
					if($scope.playing){
						pause();
					}else{
						play();
					}
				}

				function play(socketData) {
					video.play();
					$scope.playing = true;
					$scope.options.onPlay(video, socketData);
					$scope.overlayVisible = false;
				}

				function createNewPlayerSession() {
					$scope.options.onSocketSessionCreate();
				}

				function toggleTextTrack() {
					$scope.isTextTrackVisible = !$scope.isTextTrackVisible;

					if($scope.isTextTrackVisible){
						video.textTracks[0].mode = "showing";
					}else{
						video.textTracks[0].mode = "hidden";
					}
				}

				//Changes the video player's volume. Takes the changing amount as a parameter.
				function changeVolume(amount) {
					$scope.volumeChanged = true;
					$timeout.cancel(volumeChangeTimeout);
					//console.log('%c event', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;', event);
					$scope.volumeLevel += amount;
					//console.log('%c event', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;', event.deltaY, $scope.volumeLevel);
					$scope.volumeLevel = $scope.volumeLevel.clamp(0, 10);
					$scope.$apply();

					volumeChangeTimeout = $timeout(function () {
						$scope.volumeChanged = false;
					}, 1500);
				}

				function initIsMobile() {
					$scope.isMobile = $scope.options.isMobile;

					// if($scope.isMobile){
					// 	console.log('%c MOBILE', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;');
					// 	$scope.playerTemplate = 'streama-video-player.touch.html';
					// }
					// else{
					// 	console.log('%c DESKTOP', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;');
					// 	$scope.playerTemplate = 'streama-video-player.desktop.html';
					// }
				}
				//Shows the video's current time and duration on the upper right corner of the screen for a limited time.
				function skipActivated(){

					$scope.currentTimeChanged = true;
					$scope.options.onTimeChange(video.currentTime, $scope.videoDuration);
					$timeout.cancel(currentTimeChangeTimeout);
					$scope.$apply();

					currentTimeChangeTimeout = $timeout(function () {
						$scope.currentTimeChanged = false;
					}, 10000);
				}


				function initMouseWheel() {
					jQuery($elem).mousewheel(function (event) {
						if (event.deltaY > 0) {
							changeVolume(1);
						} else if (event.deltaY < 0) {
							changeVolume(-1);
						}
						$scope.showControls();
					});
				}



			}
    }
  }]);
