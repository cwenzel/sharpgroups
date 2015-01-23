'use strict';

//BoardItems service used for communicating with the boardItems REST endpoints
angular.module('boardItems').factory('BoardItems', ['$resource',
	function($resource) {
		return $resource('boardItems/:boardItemId', {
			boardItemId: '@_id'
		}, {
		});
	}
]);
