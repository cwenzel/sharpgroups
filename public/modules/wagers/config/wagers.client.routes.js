'use strict';

// Setting up route
angular.module('wagers').config(['$stateProvider',
	function($stateProvider) {
		// wagers state routing
		$stateProvider.
		state('listWagers', {
			url: '/wagers/:groupId',
			templateUrl: 'modules/wagers/views/list-wagers.client.view.html'
		}).
		state('createWager', {
			url: '/wagers/create/:boardItemId/:groupId',
			templateUrl: 'modules/wagers/views/create-wager.client.view.html'
		}).
		state('viewWager', {
			url: '/wagers/:wagerId/:boardItemId/:groupId',
			templateUrl: 'modules/wagers/views/view-wager.client.view.html'
		});
	}
]);
