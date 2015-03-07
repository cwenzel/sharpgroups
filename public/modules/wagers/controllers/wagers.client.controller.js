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

		$scope.findPublic = function() {
			$scope.wagers = Wagers.query({group : $stateParams.groupId, publicUserId : $stateParams.userId});
		};

		$scope.findPublicUserName = function() {
			return $stateParams.displayName;
		};

		$scope.findOne = function() {
			$scope.wager = Wagers.get({
				wagerId: $stateParams.wagerId
			});
		};

		function calcWinnings (amount, juice) {
			juice = juice.toString();
			juice = juice.trim();
			var slashPosition = juice.indexOf('/');
			var winnings = 0;
			var conversion = 0;

			if (juice === 'EVEN') {
				winnings = amount;
			}
			else if (slashPosition > 0) {
				var numerator = juice.split('/')[0];
				var denominator = juice.split('/')[1];
				var theOdds = parseFloat(numerator / denominator);
				console.log(theOdds);
				winnings = amount * theOdds;
			}
			else if (juice[0] === '+') {
				juice = parseInt(juice);
				conversion = juice / 100;
				winnings = conversion * amount;
			}
			else {
				juice = parseInt(juice.substring(1));
				conversion = 1 / (juice / 100);
				winnings = conversion * amount;
			}

			var pay =  amount + winnings;
			pay = parseFloat(pay).toFixed(2);
			winnings = parseFloat(winnings).toFixed(2);
	
			return {'pay' : pay, 'winnings' : winnings};
		}
		$scope.calcWinnings = function(amount, juice) {
			return calcWinnings(amount, juice).pay;
		};

		$scope.winnings = '';
		$scope.pay = '';
		$scope.onAmountChanged = function() {
			if (this.amount > 0) {
				var juice = document.getElementById('itemJuice').innerText;
				var ret = calcWinnings(this.amount, juice);
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
