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
            bitems: function($stateParams, BoardItems) {
               return BoardItems.query({'groupId' : $stateParams.groupId}).$promise; 
            }
         }   
      }).
      state('viewBoardItem', {
         url: '/boardItem/:boardItemId/:groupId',
         templateUrl: 'modules/boardItems/views/view-boardItem.client.view.html'
      });
   }
]);
