'use strict';

angular.module('events').controller('EventsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Events',
	function($scope, $stateParams, $location, $http, Authentication, Events) {
		$scope.authentication = Authentication;

		$scope.find = function() {
			$scope.events = Events.query();
		};
		$scope.findByGroup = function(groupId) {
			groupId = document.URL.split('/')[5];
			$http.get('/events/groupId/'+groupId).
				  success(function(data, status, headers, config) {
				  	$scope.events = data;
				  }).
				  error(function(data, status, headers, config) {
				  });
		};

	}
]);
