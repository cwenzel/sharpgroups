'use strict';

angular.module('boardItems').controller('BoardItemsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'BoardItems', 'boardItemsProvider', 'Groups',  
	function($scope, $stateParams, $location, $http, Authentication, BoardItems, boardItemsProvider, Groups) {
                var monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		$scope.authentication = Authentication;

                $scope.eventTypeSelected = ''; 
                $scope.eventTypeFilterSelectedIndex = 0; 
                $scope.eventTypes = [{'id' : 0, 'type' : 'ALL' }];  
                Groups.get({ groupId: $stateParams.groupId }).$promise
                    .then(function(data) { 
                       $scope.group = data;
                       var i = 1; 
                       var events = data.events; 
                       events.forEach(function(element) { 
                          $scope.eventTypes.push({'id' : i++, 'type' : element.title }); 
                       }); 
                    }); 
                $scope.dates = [{ 'id' : 0, 'month' : 'ALL', 'day' : '', 'date' : null}];
                $scope.bitemsLoading = true;
                $scope.dateSelected = ''; 
                $scope.dateFilterSelected = 0;  
                boardItemsProvider.getBoardItems($stateParams.groupId) 
                   .then(function(data) {
                      var local = []; 
                      data.forEach(function(element) {
                          var eventDate = new Date(element.eventDate);
                          var i = 1; 
                          var d = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()); 
                          var ds = d.toString(); 
                          if (local.indexOf(ds) === -1) { 
                              $scope.dates.push({ 'id' : i++, 'month' : monthNames[d.getMonth()], 'day' : d.getDate(), 'date' : d}); 
                              local.push(ds); 
                          } 
                          element.timeStamp = d.getTime();
                      }); 
                      $scope.bitems = data;
                   }). 
                   finally(function() { 
                      $scope.bitemsLoading = false; 
                   });                    
                $scope.filterByDate = function(index, d) {
                   $scope.dateFilterSelected = index; 
                   $scope.dateSelected = d ? d.getTime() : '';
                };  
                $scope.filterByEventType = function(index, type) {
                   $scope.eventTypeFilterSelectedIndex = index; 
                   $scope.eventTypeSelected = type !== 'ALL' ? type : '';
                };  
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
	}
]).
service('boardItemsProvider', function($q, BoardItems) { 
   var bitems; 

   this.getBoardItems = function(groupId) { 
       if (angular.isDefined(bitems)) 
          return $q.when(bitems); 

       return BoardItems.query({'groupId' : groupId}).$promise; 
   };
});


//angular.module('sg.
 
angular.module('sg.switch.colors').controller('SwitchColors', function($scope, colorService) { 
     this.setColor = function(bi, element) {
         element.addClass(colorService.getClass(bi.teams[0])); 
         colorService.setCurrentTeam(bi.teams[0]); 
     }; 
}).
service('colorService', function() { 
    var currentTeam = null, currentClass = 'color-one'; 
    this.setCurrentTeam = function(team) { 
        this.currentTeam = team; 
    };
    this.getClass = function(team) { 
        if (team !== this.currentTeam) { 
           this.currentClass = (this.currentClass === 'color-one') ? 'color-two' : 'color-one';
        }
        return this.currentClass; 
    }; 
    this.getCurrentTeam = function() { 
        return this.currentTeam; 
    };  
}). 
directive('sgSwitchColors', function() { 
    return { 
       restrict: 'C', 
       controller: 'SwitchColors',
       link: function(scope, element, attrs, scCtrl) { 
          scCtrl.setColor(scope.boardItem, element); 
       }
    }; 
}); 
