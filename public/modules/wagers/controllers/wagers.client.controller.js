'use strict';

angular.module('wagers').controller('WagersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Wagers',
	function($scope, $stateParams, $location, Authentication, Wagers) {
		$scope.authentication = Authentication;
		$scope.create = function() {
			var wager = new Wagers({
				amount: this.amount,
				boardItem: $stateParams.boardItemId,
				group: $stateParams.groupId,
			});
			wager.$save(function(response) {
				$location.path('groups/' + $stateParams.groupId);

				$scope.amount = 0;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				//TODO this obviously sucks but hey don't try to cheat!
				alert($scope.error);
			});
		};

		$scope.find = function() {
			$scope.wagers = Wagers.query();
		};

		$scope.findOne = function() {
			$scope.wager = Wagers.get({
				wagerId: $stateParams.wagerId
			});
		};
	}
]);
