
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
