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
			var eventId = document.URL.split('/')[6]; 
			$scope.boardItems = BoardItems.query({'eventId' : eventId}, function() {
				document.getElementById('loadingMessage').innerText='';
			});
		};

		$scope.findOne = function() {
			$scope.boardItem = BoardItems.get({
				boardItemId: $stateParams.boardItemId
			});
		};

	}
]);
