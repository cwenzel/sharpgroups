'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', '$http', '$filter', 'Authentication', 'Groups',
	function($scope, $stateParams, $location, $http, $filter, Authentication, Groups) {
		$scope.authentication = Authentication;
		$scope.create = function() {
			// couldn't figure this out the angular way, so old school it is
			var eventCheckboxes = document.getElementById('groupForm').events;
			var checkedEvents = [];
			for (var i in eventCheckboxes) {
				var checkbox = eventCheckboxes[i];

				if (checkbox.checked)
					checkedEvents.push(checkbox.value);
			}

			var group = new Groups({
				title: this.title,
				description: this.description,
                                endDate: this.endDate,
                                startDate: this.startDate,
                                bankroll: this.bankroll,
				events: checkedEvents,
				maxBet: this.maxBet
			});
			group.$save(function(response) {
				$location.path('groups/' + response._id);

				$scope.title = '';
				$scope.description = '';
                                $scope.bankroll = 0;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(group) {
			if (group) {
				group.$remove();

				for (var i in $scope.groups) {
					if ($scope.groups[i] === group) {
						$scope.groups.splice(i, 1);
					}
				}
			} else {
				$scope.group.$remove(function() {
					$location.path('groups');
				});
			}
		};

		$scope.update = function() {
			var group = $scope.group;

			group.$update(function() {
				$location.path('groups/' + group._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.groups = Groups.query();
		};

		$scope.findOne = function() {
			$scope.group = Groups.get({
				groupId: $stateParams.groupId
			});
		};

                $scope.joinGroup = function() {
			var group = $scope.group;
			group.$joinGroup(function() {

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
                };

		$scope.getPlayerCount = function() {
			var group = $scope.group;
			if (group && group.players)
				return group.players.length;
			return 0;
		};

		$scope.getEvents = function() {
			$http.get('/events').
				  success(function(data, status, headers, config) {
				  	$scope.stockEvents = data;
				  }).
				  error(function(data, status, headers, config) {
				  });
		};

		$scope.getGroupUsersAndBankrolls = function() {
			var groupId = document.location.href.split('/')[5];
			$http.get('/groups/getGroupUsersAndBankrolls/' + groupId).
				  success(function(data, status, headers, config) {
				  	$scope.items = data;
				  }).
				  error(function(data, status, headers, config) {
				  });

		};

		$scope.groupHasWagersAvailable = function(group) {
			var expireDate = new Date(group.endDate);
			if (expireDate < new Date())
				return false;
			var startDate = new Date(group.startDate);
			if (startDate > new Date())
				return false;
			return true;
		};

		$scope.chatPress = function(keyEvent, group) {
			if (keyEvent.which === 13) {
				var now = new Date().toISOString();
				var message = {'text' : document.getElementById('chatBox').value, 'entered': now, 'userName': $scope.authentication.user.displayName};
				group.messages.push(message);
				group.$save(function(response) {
					document.getElementById('chatBox').value = '';
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};
		var lastEnteredDate;
		$scope.shouldDisplayMessageEntered = function(enteredDate) {
			enteredDate = $filter('date')(enteredDate, 'mediumDate');
			if (lastEnteredDate !== enteredDate) {
				lastEnteredDate = enteredDate;
				return true;
			} 
			else {
				lastEnteredDate = enteredDate;
				return false;
			}
		};
	}
]);
