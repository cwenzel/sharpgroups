'use strict';

// Setting up route
angular.module('boardItems').config(['$stateProvider',
   function($stateProvider) {
   // boardItems state routing
      $stateProvider.
      state('listBoardItems', {
	    url: '/boardItems/:groupId',
         templateUrl: 'modules/boardItems/views/list-boardItems.client.view.html',
         controller: 'BoardItemsController', 
         resolve: { 
            bitems: function($stateParams, $http) {
               return $http.get('/groups/withBoardItems/'+$stateParams.groupId).then(function(data) { return data.data; });
            }
         }   
      }).
      state('viewBoardItem', {
         url: '/boardItem/:boardItemId/:groupId',
         templateUrl: 'modules/boardItems/views/view-boardItem.client.view.html'
      });
   }
]);
