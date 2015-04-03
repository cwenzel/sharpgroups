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
			$scope.wagers = Wagers.query({group : $stateParams.groupId}, function() {
				document.getElementById('loadingMessage').innerText = '';
			});
		};

		$scope.findPublic = function() {
			$scope.wagers = Wagers.query({group : $stateParams.groupId, publicUserId : $stateParams.userId}, function() {
				document.getElementById('loadingMessage').innerText = '';
			});
		};

		$scope.findPublicUserName = function() {
			return $stateParams.displayName;
		};

		$scope.findOne = function() {
			$scope.wager = Wagers.get({
				wagerId: $stateParams.wagerId
			});
		};

		$scope.calcWinnings = function(amount, juice) {
			return window.serverBrowserUtils.calcWinnings(amount, juice).pay;
		};

		$scope.winnings = '';
		$scope.pay = '';
		$scope.onAmountChanged = function() {
			if (this.amount > 0) {
				var juice = document.getElementById('itemJuice').innerText;
				var ret = window.serverBrowserUtils.calcWinnings(this.amount, juice);
				$scope.pay = ret.pay;
				$scope.winnings = ret.winnings;
			}
			else {
				$scope.pay = '';
				$scope.winnings = '';
			}
		};
	}
]);
