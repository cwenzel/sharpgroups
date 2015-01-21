'use strict';

angular.module('wagers').controller('WagersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Wagers',
	function($scope, $stateParams, $location, Authentication, Wagers) {
		$scope.authentication = Authentication;
		$scope.create = function() {
			var wager = new Wagers({
				amount: this.amount,
			});
			wager.$save(function(response) {
				$location.path('wagers/' + response._id);

				$scope.amount = 0;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};


		$scope.update = function() {
			var wager = $scope.wager;

			wager.$update(function() {
				$location.path('wagers/' + wager._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
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

                $scope.placeWager = function(wager) {
			var wager = $scope.wager;
			wager.$placeWager(function() {
				// do nothing for now
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
                };

	}
]);
