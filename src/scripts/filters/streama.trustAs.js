
angular.module('streama.videoPlayer').filter('streamaTrustAs', ['$sce', function ($sce) {
	return function(input, type) {
		return $sce.trustAs(type, input);
	};

}]);