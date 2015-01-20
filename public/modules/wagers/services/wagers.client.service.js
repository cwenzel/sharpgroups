'use strict';

//Wagers service used for communicating with the wagers REST endpoints
angular.module('wagers').factory('Wagers', ['$resource',
	function($resource) {
		return $resource('wagers/:wagerId', {
			wagerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
		});
	}
]);
