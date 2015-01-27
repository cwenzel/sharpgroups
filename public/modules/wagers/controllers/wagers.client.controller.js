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
			});
		};

		$scope.find = function() {
			$scope.wagers = Wagers.query({group : $stateParams.groupId});
		};

		$scope.findOne = function() {
			$scope.wager = Wagers.get({
				wagerId: $stateParams.wagerId
			});
		};

		$scope.winnings = '';
		$scope.pay = '';
		$scope.onAmountChanged = function() {
			if (this.amount > 0) {
				var juice = document.getElementById('itemJuice').innerText;
				var slashPosition = juice.indexOf('/');
	
				if (juice === 'EVEN') {
					winnings = this.amount;
				}
				else if (slashPosition > 0) {
					var theOdds = parseFloat(juice);
					$scope.winnings = this.amount * theOdds;
				}
				else if (juice[0] == '+') {
					juice = parseInt(juice);
					var conversion = juice / 100;
					$scope.winnings = conversion * this.amount;
				}
				else {
					juice = parseInt(juice.substring(1));
					var conversion = 1 / (juice / 100);
					$scope.winnings = conversion * this.amount;
				}
	
				$scope.pay =  this.amount + $scope.winnings;
				
				$scope.pay = parseFloat($scope.pay).toFixed(2);
				$scope.winnings = parseFloat($scope.winnings).toFixed(2);
			}
		}
	}
]);
