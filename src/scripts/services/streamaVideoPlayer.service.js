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
				selectedEpisodes: null,
				currentEpisode: {},
				onSocketSessionCreate: angular.noop,
				onTimeChange: angular.noop,
				onError: angular.noop,
				onPlay: angular.noop,
				onPause: angular.noop,
				onClose: angular.noop,
				onNext: angular.noop,
				onVideoClick: angular.noop,
				isTouch: false
			};
		}


		function initOptions(options) {
			if(!options.selectedEpisodes && options.showEpisodeBrowser && options.currentEpisode && options.episodeList){
				options.selectedEpisodes = options.episodeList[options.currentEpisode.season];
			}

			return angular.merge(getDefaultOptions(), options);

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
