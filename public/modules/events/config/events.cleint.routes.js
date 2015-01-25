'use strict';

// Setting up route
angular.module('events').config(['$stateProvider',
	function($stateProvider) {
		// events state routing
		$stateProvider.
		state('listEvents', {
			url: '/events/:groupId',
			templateUrl: 'modules/events/views/list-events.client.view.html'
		});
	}
]);
