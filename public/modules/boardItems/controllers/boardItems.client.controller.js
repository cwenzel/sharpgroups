'use strict';

angular.module('boardItems').controller('BoardItemsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'BoardItems',
	function($scope, $stateParams, $location, $http, Authentication, BoardItems) {
		$scope.authentication = Authentication;
                $scope.bitemsLoading = true;
                $scope.dates = [];  
                BoardItems.query({'groupId' : $stateParams.groupId}).$promise
                   .then(function(data) {
                      var local = []; 
                      data.forEach(function(element) {
                          var eventDate = new Date(element.eventDate);
                          var d = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()); 
                          var ds = d.toString(); 
                          if (local.indexOf(ds) === -1) { 
                              $scope.dates.push(d); 
                              local.push(ds); 
                          } 
                      }); 
                      $scope.bitems = data; 
                   }). 
                   finally(function() { 
                      $scope.bitemsLoading = false; 
                   });                     
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
]); 

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
