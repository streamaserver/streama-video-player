
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