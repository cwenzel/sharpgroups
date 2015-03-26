'use strict';

angular.module('boardItems').controller('BoardItemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'BoardItems',
	function($scope, $stateParams, $location, Authentication, BoardItems) {
		$scope.authentication = Authentication;
		$scope.create = function() {
			var boardItem = new BoardItems({
				amount: this.amount,
			});
			boardItem.$save(function(response) {
				$location.path('boardItems/' + response._id);

				$scope.amount = 0;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.boardItems = BoardItems.query({'groupId' : $stateParams.groupId}, function() {
				document.getElementById('loadingMessage').innerText='';
			});
		};

		$scope.findOne = function() {
			$scope.boardItem = BoardItems.get({
				boardItemId: $stateParams.boardItemId
			});
		};
		var currentTeams = [];
		var currentColor = 'color-one';
		$scope.getClassForBoardItem = function(boardItem) {
			var switchColors = false;
			if (boardItem.teams[0] !== currentTeams[0] && currentTeams.length > 0)
				switchColors = true;

			currentTeams = boardItem.teams;
			if (switchColors) {
				currentColor = (currentColor === 'color-one') ? 'color-two' : 'color-one';
			}
			return currentColor;
		};
	}
]);
