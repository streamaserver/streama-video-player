angular.module('streama.videoPlayer').filter('videoDurationDisplay', ['$filter', function($filter) {
	return function(seconds) {
		var date =  new Date(1970, 0, 1).setSeconds(seconds);
		return $filter('date')(date, 'mm') + ' Min.';
	};
}]);