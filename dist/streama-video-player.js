angular.module('streama.videoPlayer', ['LocalStorageModule', 'rzModule', 'streama.translations']);


/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};
angular.module('streama.videoPlayer').run(['$templateCache', function($templateCache) {$templateCache.put('streama-video-player.desktop.html','<div class="player-wrapper">\n  <div class="video-wrapper-inner"  ng-mousemove="showControls()">\n    <div>\n      <div class="volume-info" ng-show="volumeChanged">\n        {{volumeLevel * 10}}% Volume\n      </div>\n\n      <div class="volume-info" ng-show="currentTimeChanged">\n        <br>\n        <strong ng-show="currentTime">\n          <span>{{currentTime | streamaVideoTime}}</span>\n        </strong>\n        <span>{{videoDuration | streamaVideoTime}}</span>\n      </div>\n    </div>\n\n    <i class="ion-android-arrow-back player-back" ng-class="{\'visible\': controlsVisible}" ng-click="closeVideo()"></i>\n\n\n    <div class="spinner" ng-show="loading">\n      <div class="bounce1"></div>\n      <div class="bounce2"></div>\n      <div class="bounce3"></div>\n    </div>\n\n    <div class="overlay" ng-class="{\'visible\': overlayVisible}" ng-if="options.videoOverlayEnabled">\n      <div class="video-info">\n        <p>You\'re watching</p>\n\n        <h1>{{options.videoMetaTitle}}</h1>\n        <h3>{{options.videoMetaSubtitle}}</h3>\n        <p ng-if="!isMobile">{{options.videoMetaDescription}}</p>\n      </div>\n    </div>\n\n    <i ng-if="isMobile && !playing && canplay" class="play-button ion-ios-play" ng-click="pause();play()"></i>\n\n    <div class="player-controls-wrapper player-active no-select" ng-class="{\'visible\': controlsVisible}" ng-hide="loading && !initialPlay">\n\n      <div class="slider-ui-wrapper" ng-show="!volumeOpen">\n        <div class="scrupper-wrapper">\n          <rzslider rz-slider-model="currentTime" rz-slider-options="scrubber.options"></rzslider>\n        </div>\n\n        <!--<div id="playerDurationSlider" class="player-ui-slider" ui-slider="scrubberOptions" min="0" max="{{videoDuration}}" ng-model="currentTime"></div>-->\n        <div class="time-display">\n          <strong ng-show="currentTime">\n            <span>{{currentTime | streamaVideoTime}}</span>\n          </strong>\n          <span>{{videoDuration | streamaVideoTime}}</span>\n        </div>\n      </div>\n\n      <section class="player-control-bar no-select">\n\n        <div class="player-control-button player-play-pause play ion-play" ng-show="!playing" ng-click="play()"></div>\n\n        <div class="player-control-button player-play-pause play ion-pause" ng-show="playing" ng-click="pause()"></div>\n\n        <div class="volume-control player-control-button volume" ng-mouseleave="volumeOpen = false" ng-mouseenter="volumeOpen = true">\n          <i ng-class="{\n        \'ion-volume-mute\': volumeLevel == 0,\n        \'ion-volume-low\': volumeLevel > 0 && volumeLevel < 3,\n        \'ion-volume-medium\': volumeLevel >= 3 && volumeLevel < 6,\n        \'ion-volume-high\': volumeLevel >= 6\n        }" ng-click="playerVolumeToggle()"\n          ></i>\n\n          <div id="player-menu-volume" class="player-menu" ng-show="volumeOpen">\n            <div class="volume-menu-content">\n              <rzslider style="height: 120px;" rz-slider-model="volumeLevel" rz-slider-options="volume.options"></rzslider>\n            </div>\n          </div>\n        </div>\n\n\n        <div class="player-status">\n          <span class="player-status-main-title">{{options.videoMetaTitle}}</span>\n          <span>{{options.videoMetaSubtitle}}</span>\n        </div>\n\n        <div class="player-control-button player-next-episode ion-ios-skipforward" ng-if="options.showNextButton" ng-click="next()"></div>\n\n        <div class="player-control-button player-episode-selector" ng-if="options.showEpisodeBrowser">\n          <i class="ion-ios-browsers" ng-click="episodeBrowseOpen = !episodeBrowseOpen"></i>\n          <div id="player-menu-episode-selector" class="player-menu" ng-show="episodeBrowseOpen">\n            <div class="episode-selector-container">\n              <div class="episode-selector-slider" ng-class="{\'slide-left\': options.selectedEpisodes}">\n                <div class="season-list-container">\n                  <h2 class="seasons-title">{{options.videoMetaTitle}}</h2>\n                  <ul class="season-list">\n                    <li class="season" ng-click="toggleSelectEpisodes(episodes)"\n                        ng-repeat="(season, episodes) in options.episodeList">\n                      <span>{{\'VIDEO.SEASON\' | translate}} {{season}}</span>\n                    </li>\n                  </ul>\n                </div>\n              </div>\n\n              <div class="episode-selector-slider" ng-class="{\'slide-left\': options.selectedEpisodes}">\n                <div class="season-list-container">\n                  <h2 class="seasons-title" ng-click="toggleSelectEpisodes()">\n                    <span class="back-button"><i class="ion-chevron-left"></i></span>\n                    {{\'VIDEO.SEASON\' | translate}} {{options.selectedEpisodes[0].season_number}}\n                  </h2>\n                  <ul class="episode-list">\n                    <li class="episode" ng-repeat="episode in options.selectedEpisodes"\n                        ng-class="{\'current\': (episode.episode_number == options.currentEpisode.episode && episode.season_number == options.currentEpisode.season), \'no-files\': !episode.hasFile}" >\n                      <div class="flex-wrapper">\n                        <span class="episode-number">{{episode.episode_number | streamaPadnumber:2}}</span>\n                        <span class="episode-name" ng-click="visible = !visible">{{episode.name}}</span>\n                        <span class="episode-play" ng-if="episode.hasFile" ui-sref="player({videoId: episode.id})"><i class="ion-play"></i></span>\n                      </div>\n\n                      <div class="extra-episode-info" ng-if="visible || (episode.episode_number == video.episode_number && episode.season_number == video.season_number)">\n                        <div class="image-wrapper">\n                          <img ng-if="episode.still_path" ng-src="https://image.tmdb.org/t/p/w92/{{episode.still_path}}"/>\n                          <div ng-if="!episode.still_path" class="fallback-image"></div>\n                        </div>\n\n                        <p>{{episode.overview.length > 250 ? (episode.overview.substring(0, 250) + \'...\') : episode.overview}}</p>\n                      </div>\n                    </li>\n                  </ul>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class="player-control-button player-fill-screen ion-android-wifi" ng-if="options.showSocketSession" ng-click="createNewPlayerSession()"></div>\n\n        <div class="player-control-button player-fill-screen ion-android-textsms" ng-if="options.videoTrack" ng-class="{\'inactive\': !isTextTrackVisible}" ng-click="toggleTextTrack()"></div>\n\n        <div class="player-control-button player-fill-screen"\n             ng-click="fullScreen()" ng-class="{\'ion-arrow-shrink\': isFullScreen, \'ion-arrow-expand\': !isFullScreen}"></div>\n      </section>\n    </div>\n\n\n    <video ng-if="isInitialized" id="video" ng-src="{{options.videoSrc}}" type="{{options.videoType}}" ng-click="clickVideo()">\n      <track ng-if="options.videoTrack" ng-src="{{options.videoTrack}}" kind="subtitles" srclang="en" label="English">\n    </video>\n\n  </div>\n</div>\n\n\n');
$templateCache.put('streama-video-player.episodeSelector.html','<div class="mobile-overlay-container mobile-episode-selector-container">\n  <div class="mobile-episode-selector-season-tabs">\n    <div class="mobile-episode-selector-season-tab" ng-repeat="(season, episodes) in options.episodeList">\n      <span>{{\'VIDEO.SEASON\' | translate}} {{season}}</span>\n    </div>\n  </div>\n\n  <div class="mobile-episode-selector-outer">\n    <div class="mobile-episode-selector-inner">\n      <div class="mobile-episode-box" ng-repeat="episode in options.selectedEpisodes" ng-class="{\'active\': episode.id == options.currentEpisode.id}">\n        <div class="image-wrapper">\n          <i ng-if="episode.id != options.currentEpisode.id" class="play-button ion-ios-play" ng-click="changeEpisode(episode)"></i>\n          <img ng-if="episode.still_path" ng-src="{{episode.still_path}}"/>\n          <div ng-if="!episode.still_path" class="fallback-image"></div>\n        </div>\n        <h3>\n          <span class="episode-number">{{episode.episode_number}}. </span>\n          <span class="episode-name" ng-click="visible = !visible">{{episode.name}}</span>\n\n          <span class="episode-duration">{{episode.videoDuration | videoDurationDisplay}}</span>\n        </h3>\n        <p class="episode-overview">{{episode.overview.length > 250 ? (episode.overview.substring(0, 250) + \'...\') : episode.overview}}</p>\n      </div>\n    </div>\n  </div>\n\n  \n</div>');
$templateCache.put('streama-video-player.html','<div>\n  <pre>{{playerTemplate}}</pre>\n  <div ng-if="playerTemplate" ng-include="playerTemplate"></div>\n\n</div>\n\n');
$templateCache.put('streama-video-player.touch.html','<div class="player-wrapper">\n  <div class="video-wrapper-inner">\n\n    <i class="spinner ion-load-c" ng-if="loading"></i>\n\n    <i ng-if="!playing && canplay" class="play-button ion-ios-play" ng-click="$event.stopPropagation();togglePlay()"></i>\n\n    <!--<div class="player-controls-wrapper player-active no-select" ng-class="{\'visible\': controlsVisible}" ng-hide="loading && !initialPlay">-->\n\n      <!--<div class="slider-ui-wrapper" ng-show="!volumeOpen">-->\n        <!--<div class="scrupper-wrapper">-->\n          <!--<rzslider rz-slider-model="currentTime" rz-slider-options="scrubber.options"></rzslider>-->\n        <!--</div>-->\n\n        <!--&lt;!&ndash;<div id="playerDurationSlider" class="player-ui-slider" ui-slider="scrubberOptions" min="0" max="{{videoDuration}}" ng-model="currentTime"></div>&ndash;&gt;-->\n        <!--<div class="time-display">-->\n          <!--<strong ng-show="currentTime">-->\n            <!--<span>{{currentTime | streamaVideoTime}}</span>-->\n          <!--</strong>-->\n          <!--<span>{{videoDuration | streamaVideoTime}}</span>-->\n        <!--</div>-->\n      <!--</div>-->\n\n      <!--<section class="player-control-bar no-select">-->\n\n        <!--<div class="player-control-button player-play-pause play ion-play" ng-show="!playing" ng-click="play()"></div>-->\n\n        <!--<div class="player-control-button player-play-pause play ion-pause" ng-show="playing" ng-click="pause()"></div>-->\n\n        <!--<div class="volume-control player-control-button volume" ng-mouseleave="volumeOpen = false" ng-mouseenter="volumeOpen = true">-->\n          <!--<i ng-class="{-->\n        <!--\'ion-volume-mute\': volumeLevel == 0,-->\n        <!--\'ion-volume-low\': volumeLevel > 0 && volumeLevel < 3,-->\n        <!--\'ion-volume-medium\': volumeLevel >= 3 && volumeLevel < 6,-->\n        <!--\'ion-volume-high\': volumeLevel >= 6-->\n        <!--}" ng-click="playerVolumeToggle()"-->\n          <!--&gt;</i>-->\n\n          <!--<div id="player-menu-volume" class="player-menu" ng-show="volumeOpen">-->\n            <!--<div class="volume-menu-content">-->\n              <!--<rzslider style="height: 120px;" rz-slider-model="volumeLevel" rz-slider-options="volume.options"></rzslider>-->\n            <!--</div>-->\n          <!--</div>-->\n        <!--</div>-->\n\n\n        <!--<div class="player-status">-->\n          <!--<span class="player-status-main-title">{{options.videoMetaTitle}}</span>-->\n          <!--<span>{{options.videoMetaSubtitle}}</span>-->\n        <!--</div>-->\n\n        <!--<div class="player-control-button player-next-episode ion-ios-skipforward" ng-if="options.showNextButton" ng-click="next()"></div>-->\n\n        <!--<div class="player-control-button player-episode-selector" ng-if="options.showEpisodeBrowser">-->\n          <!--<i class="ion-ios-browsers" ng-click="episodeBrowseOpen = !episodeBrowseOpen"></i>-->\n          <!--<div id="player-menu-episode-selector" class="player-menu" ng-show="episodeBrowseOpen">-->\n            <!--<div class="episode-selector-container">-->\n              <!--<div class="episode-selector-slider" ng-class="{\'slide-left\': options.selectedEpisodes}">-->\n                <!--<div class="season-list-container">-->\n                  <!--<h2 class="seasons-title">{{options.videoMetaTitle}}</h2>-->\n                  <!--<ul class="season-list">-->\n                    <!--<li class="season" ng-click="toggleSelectEpisodes(episodes)"-->\n                        <!--ng-repeat="(season, episodes) in options.episodeList">-->\n                      <!--<span>{{\'VIDEO.SEASON\' | translate}} {{season}}</span>-->\n                    <!--</li>-->\n                  <!--</ul>-->\n                <!--</div>-->\n              <!--</div>-->\n\n              <!--<div class="episode-selector-slider" ng-class="{\'slide-left\': options.selectedEpisodes}">-->\n                <!--<div class="season-list-container">-->\n                  <!--<h2 class="seasons-title" ng-click="toggleSelectEpisodes()">-->\n                    <!--<span class="back-button"><i class="ion-chevron-left"></i></span>-->\n                    <!--{{\'VIDEO.SEASON\' | translate}} {{options.selectedEpisodes[0].season_number}}-->\n                  <!--</h2>-->\n                  <!--<ul class="episode-list">-->\n                    <!--<li class="episode" ng-repeat="episode in options.selectedEpisodes"-->\n                        <!--ng-class="{\'current\': (episode.episode_number == options.currentEpisode.episode && episode.season_number == options.currentEpisode.season), \'no-files\': !episode.hasFile}" >-->\n                      <!--<div class="flex-wrapper">-->\n                        <!--<span class="episode-number">{{episode.episode_number | streamaPadnumber:2}}</span>-->\n                        <!--<span class="episode-name" ng-click="visible = !visible">{{episode.name}}</span>-->\n                        <!--<span class="episode-play" ng-if="episode.hasFile" ui-sref="player({videoId: episode.id})"><i class="ion-play"></i></span>-->\n                      <!--</div>-->\n\n                      <!--<div class="extra-episode-info" ng-if="visible || (episode.episode_number == video.episode_number && episode.season_number == video.season_number)">-->\n                        <!--<div class="image-wrapper">-->\n                          <!--<img ng-if="episode.still_path" ng-src="https://image.tmdb.org/t/p/w92/{{episode.still_path}}"/>-->\n                          <!--<div ng-if="!episode.still_path" class="fallback-image"></div>-->\n                        <!--</div>-->\n\n                        <!--<p>{{episode.overview.length > 250 ? (episode.overview.substring(0, 250) + \'...\') : episode.overview}}</p>-->\n                      <!--</div>-->\n                    <!--</li>-->\n                  <!--</ul>-->\n                <!--</div>-->\n              <!--</div>-->\n            <!--</div>-->\n          <!--</div>-->\n        <!--</div>-->\n\n        <!--<div class="player-control-button player-fill-screen ion-android-wifi" ng-if="options.showSocketSession" ng-click="createNewPlayerSession()"></div>-->\n\n        <!--<div class="player-control-button player-fill-screen ion-android-textsms" ng-if="options.videoTrack" ng-class="{\'inactive\': !isTextTrackVisible}" ng-click="toggleTextTrack()"></div>-->\n\n        <!--<div class="player-control-button player-fill-screen"-->\n             <!--ng-click="fullScreen()" ng-class="{\'ion-arrow-shrink\': isFullScreen, \'ion-arrow-expand\': !isFullScreen}"></div>-->\n      <!--</section>-->\n    <!--</div>-->\n\n    <div class="player-controls-mobile" ng-show="isMobileControlsVisible" ng-click="hideMobileControls()">\n      <div class="player-controls-topbar">\n        <div class="player-controls-box player-control-button" ng-click="$event.stopPropagation();">\n          <i class="ion-chevron-left"></i>\n        </div>\n        <div class="player-controls-stretch player-controls-metaTitle">\n          {{options.videoMetaTitle}}\n        </div>\n\n        <div class="player-controls-box player-control-button" ng-click="$event.stopPropagation(); toggleMobileOverlayBox(\'track\');">\n          <i class="ion-android-textsms"></i>\n        </div>\n\n        <div class="player-controls-box player-control-button" ng-click="$event.stopPropagation(); toggleMobileOverlayBox(\'episode\')">\n          <i class="ion-ios-browsers"></i>\n        </div>\n\n      </div>\n      <div class="player-controls-bottombar">\n        <div class="player-controls-box player-control-button" ng-click="$event.stopPropagation();togglePlay()">\n          <i class="player-play-pause play ion-play" ng-show="!playing"></i>\n          <i class="player-play-pause play ion-pause" ng-show="playing"></i>\n        </div>\n        <div class="player-controls-stretch">\n          <rzslider ng-if="scrubber.options" rz-slider-model="currentTime" rz-slider-options="scrubber.options"></rzslider>\n        </div>\n        <div class="player-controls-box">\n          <div class="time-display">\n            {{videoDuration | streamaVideoTime}}\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class="player-controls-mobile-overlay-box" ng-if="mobileOverlayBox.isVisble">\n      <i class="ion-close player-controls-mobile-overlay-box-close" ng-click="toggleMobileOverlayBox()"></i>\n\n      <div ng-include="\'streama-video-player.\' + mobileOverlayBox.type + \'Selector.html\'"></div>\n    </div>\n\n    <video ng-if="isInitialized" id="video" ng-src="{{options.videoSrc}}" type="{{options.videoType}}" ng-click="clickVideo()">\n      <track ng-repeat="subtitle in options.subtitles" ng-src="{{subtitle.src}}" kind="subtitles" id="subtitle-{{subtitle.id}}"\n             srclang="{{subtitle.subtitleSrcLang}}" label="{{subtitle.subtitleLabel}}" src="{{subtitle.src}}">\n    </video>\n\n  </div>\n</div>\n\n\n');
$templateCache.put('streama-video-player.trackSelector.html','<div class="mobile-overlay-container mobile-track-selector-container">\n\n  <div class="mobile-episode-selector-season-tabs">\n    <div class="mobile-episode-selector-season-tab">\n      <span>{{\'VIDEO.SUBTITLES\' | translate}}</span>\n    </div>\n  </div>\n\n    <ul class="track-selector-list">\n      <li class="track-selector-item" ng-class="{\'active\': track.id == selectedSubtitleId}"\n          ng-repeat="track in options.subtitles" ng-click="selectSubtitle(track)">\n        {{track.subtitleLabel}}\n\n        <i ng-if="track.id == selectedSubtitleId" class="ion-checkmark"></i>\n      </li>\n    </ul>\n</div>');}]);
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
				$scope.currentTime = 0;
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
						streamaVideoPlayerService.initMousetrap(video, $scope, skipActivated, changeVolume);
					}
					initExternalTriggers();
					initIsMobile();
					$scope.$on('$destroy', onDirectiveDestroy);
					$scope.$on('$stateChangeSuccess', onStateChangeSuccess);
					generateVolumeScrubberOptions();

					$timeout(function () {
						var $video = $elem.find('video');
						$video.bind("contextmenu",function(){return false;});
						video = $video[0];
						video.oncanplay = oncanplay;
						video.onwaiting = onwaiting;
						video.onplaying = onplaying;
						video.onerror = onerror;
						video.ontimeupdate = ontimeupdate;
						video.addEventListener('ended', onVideoEnded);
						selectSubtitle(getCurrentSubtitleTrack());
					});
				}


				function changeEpisode(episode) {
					$scope.options.onEpisodeChange(episode);
				}

				function selectSubtitle(subtitle) {
					if(!subtitle){
						$scope.selectedSubtitleId = null;
						localStorageService.set('selectedSubtitleLanguage', null);
						$scope.options.onSubtitleSelect(null);
						return;
					}

					_.forEach(video.textTracks, function(textTrack, key) {
						if(textTrack.id === 'subtitle-' + subtitle.id) {
							textTrack.mode = 'showing';
						}
						else{
							textTrack.mode = 'hidden';
						}

					});

					$scope.options.onSubtitleSelect(subtitle);
					$scope.selectedSubtitleId = subtitle.id;
					localStorageService.set('selectedSubtitleLanguage', subtitle.subtitleSrcLang);
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
								$scope.currentTime = modelValue;
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
						$scope.currentTime = data.currentPlayerTime;
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

				function ontimeupdate(event){
					if(!isAutoScrubberUpdate){
						return;
					}
					$scope.currentTime = video.currentTime;
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

				function onerror(){
					if(!video.duration && !$scope.initialPlay){
						$scope.options.onError();
					}
				}

				function onplaying() {
					$scope.loading = false;
				}

				function oncanplay() {
					if(!$scope.initialPlay){
						$scope.canplay = true;
						console.log('%c oncanplay', 'color: deeppink; font-weight: bold; text-shadow: 0 0 5px deeppink;');
						$scope.loading = false;
						if(!$scope.isMobile){
							$scope.play();
						}else{
							$scope.pause();
						}
						$scope.videoDuration = video.duration;
						generateScrupperOoptions(video.duration);

						video.currentTime = $scope.options.customStartingTime || 0;
						$scope.currentTime = video.currentTime || 0;
						$scope.initialPlay = true;
						if($scope.options.videoTrack){
							video.textTracks[0].mode = "hidden";
						}
					}
				}

				function onwaiting() {
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

'use strict';

angular.module('streama.videoPlayer').factory('streamaVideoPlayerService', [
	'localStorageService', '$timeout', '$http',
	function (localStorageService, $timeout, $http) {
		var skippingDuration = 20;  //Skipping duration for holding an arrow key to left or right.
		var longSkippingDuration = 60; //Skipping duration for holding ctrl + arrow key.

		return {
			getDefaultOptions: getDefaultOptions,
			initOptions: initOptions,
			initMousetrap: initMousetrap
		};


		function getDefaultOptions(){
			return {
				customStartingTime: 0,
				isMobile: null,
				rememberVolumeSetting: true,
				videoMetaTitle: '',
				videoMetaSubtitle: '',
				videoMetaDescription: '',
				videoSrc: '',
				videoType: '',
				videoTrack: '',
				subtitles: [],
				videoOverlayEnabled: true,
				showEpisodeBrowser: false,
				showNextButton: false,
				showSocketSession: true,
				episodeList: {},
				selectedEpisodes: null,
				currentEpisode: {},
				onSocketSessionCreate: angular.noop,
				onTimeChange: angular.noop,
				onError: angular.noop,
				onPlay: angular.noop,
				onPause: angular.noop,
				onClose: angular.noop,
				onNext: angular.noop,
				onEpisodeChange: angular.noop,
				onVideoClick: angular.noop,
				onSubtitleSelect: angular.noop,
				isTouch: false
			};
		}


		function initOptions(options) {
			options = options || {};
			if(!options.selectedEpisodes && options.showEpisodeBrowser && options.currentEpisode && options.episodeList){
				options.selectedEpisodes = options.episodeList[options.currentEpisode.season];
			}
			if(!options.videoMetaTitle){
				options.videoMetaTitle = options.videoSrc;
			}

			options = angular.merge(getDefaultOptions(), options);


			if(options.isMobile == undefined){
				if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
					|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
					options.isMobile = true;
				}else{
					options.isMobile = false;
				}
			}
			return options;
		}

		function initMousetrap(video, $scope, skipActivated, changeVolume) {
			Mousetrap.bind('left', function (event) {
				event.preventDefault();
				skipActivated();
				video.currentTime -= skippingDuration;
			}, 'keyup');

			Mousetrap.bind('right', function (event) {
				event.preventDefault();
				skipActivated();
				video.currentTime += skippingDuration;
			}, 'keyup');

			Mousetrap.bind('ctrl+right', function (event) {
				event.preventDefault();
				skipActivated();
				video.currentTime += longSkippingDuration;
			}, 'keyup');

			Mousetrap.bind('ctrl+left', function (event) {
				event.preventDefault();
				skipActivated();
				video.currentTime -= longSkippingDuration;
			}, 'keyup');

			Mousetrap.bind('alt+enter', function (event) {
				event.preventDefault();
				$scope.fullScreen();
			});

			Mousetrap.bind(['backspace', 'del'], function (event) {
				event.preventDefault();
				$scope.closeVideo();
			});

			Mousetrap.bind('s', function (event) {
				event.preventDefault();
				$scope.toggleTextTrack();
			});

			Mousetrap.bind('up', function (event) {
				event.preventDefault();
				changeVolume(1);
			});

			Mousetrap.bind('down', function (event) {
				event.preventDefault();
				changeVolume(-1);
			});

			Mousetrap.bind('m', function (event) {
				event.preventDefault();
				$scope.playerVolumeToggle();
				$scope.showControls();
			});

			Mousetrap.bind('e', function (event) {
				event.preventDefault();
				$scope.toggleSelectEpisodes();
				$scope.showControls();
			});

			Mousetrap.bind('space', function () {
				if ($scope.playing) {
					$scope.pause();
				} else {
					$scope.play();
				}
				$scope.$apply();
			});
		}

	}]);


angular.module('streama.videoPlayer').filter('streamaPadnumber', [function () {
	return function(input, length) {
		return pad(input, length);
	};


	function pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

}]);
angular.module('streama.videoPlayer').filter('videoDurationDisplay', ['$filter', function($filter) {
	return function(seconds) {
		var date =  new Date(1970, 0, 1).setSeconds(seconds);
		return $filter('date')(date, 'mm') + ' Min.';
	};
}]);

angular.module('streama.videoPlayer').filter('streamaVideoTime', ['$filter', function($filter) {
	return function(seconds) {
		var date =  new Date(1970, 0, 1).setSeconds(seconds);
		if(seconds >= 3600){
			return $filter('date')(date, 'hh:mm:ss');
		}else{
			return $filter('date')(date, 'mm:ss');
		}
	};
}]);
