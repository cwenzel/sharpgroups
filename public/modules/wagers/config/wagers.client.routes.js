'use strict';

// Setting up route
angular.module('wagers').config(['$stateProvider',
	function($stateProvider) {
		// wagers state routing
		$stateProvider.
		state('listWagers', {
			url: '/wagers',
			templateUrl: 'modules/wagers/views/list-wagers.client.view.html'
		});
	}
]);
