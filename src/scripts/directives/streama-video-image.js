//= wrapped

angular.module('streama.videoPlayer').directive('streamaVideoImage', function () {
  return {
    restrict: 'E',
    templateUrl: 'streama-video-image.html',
    scope: {
      video: '=',
      type: '@',
      size: '@'
    },
    link: function ($scope, $elem, $attrs) {

    }
  }
});
