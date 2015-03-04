'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'btford.socket-io'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module

ApplicationConfiguration.registerModule('boardItems');
ApplicationConfiguration.registerModule('groups');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module


ApplicationConfiguration.registerModule('events');
ApplicationConfiguration.registerModule('groups');
ApplicationConfiguration.registerModule('boardItems');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('groups');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Use Applicaion configuration module to register a new module

ApplicationConfiguration.registerModule('boardItems');
ApplicationConfiguration.registerModule('groups');
ApplicationConfiguration.registerModule('wagers');

'use strict';

// Setting up route
angular.module('boardItems').config(['$stateProvider',
	function($stateProvider) {
		// boardItems state routing
		$stateProvider.
		state('listBoardItems', {
			url: '/boardItems/:groupId/:eventId',
			templateUrl: 'modules/boardItems/views/list-boardItems.client.view.html'
		}).
		state('viewBoardItem', {
			url: '/boardItem/:boardItemId/:groupId',
			templateUrl: 'modules/boardItems/views/view-boardItem.client.view.html'
		});
	}
]);

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

'use strict';

//BoardItems service used for communicating with the boardItems REST endpoints
angular.module('boardItems').factory('BoardItems', ['$resource',
	function($resource) {
		return $resource('boardItems/:boardItemId', {
			boardItemId: '@_id'
		}, {
		});
	}
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict'; 

angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
        });
    }
]);

'use strict';

// Setting up route
angular.module('events').config(['$stateProvider',
	function($stateProvider) {
		// events state routing
		$stateProvider.
		state('listEvents', {
			url: '/events/:groupId',
			templateUrl: 'modules/events/views/list-events.client.view.html'
		});
	}
]);

'use strict';

angular.module('events').controller('EventsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Events',
	function($scope, $stateParams, $location, $http, Authentication, Events) {
		$scope.authentication = Authentication;

		$scope.find = function() {
			$scope.events = Events.query();
		};
		$scope.findByGroup = function(groupId) {
			groupId = document.URL.split('/')[5];
			$http.get('/events/groupId/'+groupId).
				  success(function(data, status, headers, config) {
				  	$scope.events = data;
				  }).
				  error(function(data, status, headers, config) {
				  });
		};

	}
]);

'use strict';

//Events service used for communicating with the events REST endpoints
angular.module('events').factory('Events', ['$resource',
	function($resource) {
		return $resource('events/:eventId', {
			eventId: '@_id'
		}, {
		});
	}
]);

'use strict';

// Configuring the Groups module
angular.module('groups').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Groups', 'groups', 'dropdown', '/groups(/create)?');
		Menus.addSubMenuItem('topbar', 'groups', 'All Groups', 'groups');
		Menus.addSubMenuItem('topbar', 'groups', 'New Group', 'groups/create');
	}
]);

'use strict';

// Setting up route
angular.module('groups').config(['$stateProvider',
	function($stateProvider) {
		// Groups state routing
		$stateProvider.
		state('listGroups', {
			url: '/groups',
			templateUrl: 'modules/groups/views/list-groups.client.view.html'
		}).
		state('createGroup', {
			url: '/groups/create',
			templateUrl: 'modules/groups/views/create-group.client.view.html'
		}).
		state('viewGroup', {
			url: '/groups/:groupId',
			templateUrl: 'modules/groups/views/view-group.client.view.html'
		}).
		state('joinGroup', {
			url: '/groups/join/:groupId',
			templateUrl: 'modules/groups/views/view-group.client.view.html'
		}).
		state('editGroup', {
			url: '/groups/:groupId/edit',
			templateUrl: 'modules/groups/views/edit-group.client.view.html'
		});
	}
]);

'use strict';

angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Groups', 'Socket',
	function($scope, $stateParams, $location, $http, Authentication, Groups) {
		$scope.authentication = Authentication;
		$scope.create = function() {
			// couldn't figure this out the angular way, so old school it is
			var eventCheckboxes = document.getElementById('groupForm')['events'];
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

                $scope.joinGroup = function(group) {
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

		$scope.groupExpired = function(group) {
			var expireDate = new Date(group.endDate);
			if (expireDate < new Date())
				return true;
			return false;
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
	}
]);

'use strict';

//Groups service used for communicating with the groups REST endpoints
angular.module('groups').factory('Groups', ['$resource',
	function($resource) {
		return $resource('groups/:groupId', {
			groupId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			joinGroup: {
				method: 'PUT'
			},
			userInGroup: {
				method: 'PUT'
			},
		});
	}
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('wagers').config(['$stateProvider',
	function($stateProvider) {
		// wagers state routing
		$stateProvider.
		state('listWagers', {
			url: '/wagers/:groupId',
			templateUrl: 'modules/wagers/views/list-wagers.client.view.html'
		}).
		state('listPublicWagers', {
			url: '/wagers/leaderboard/:groupId/:userId/:displayName',
			templateUrl: 'modules/wagers/views/list-public-wagers.client.view.html'
		}).
		state('createWager', {
			url: '/wagers/create/:boardItemId/:groupId',
			templateUrl: 'modules/wagers/views/create-wager.client.view.html'
		}).
		state('viewWager', {
			url: '/wagers/:wagerId/:boardItemId/:groupId',
			templateUrl: 'modules/wagers/views/view-wager.client.view.html'
		});
	}
]);

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
			else if (juice[0] == '+') {
				juice = parseInt(juice);
				var conversion = juice / 100;
				winnings = conversion * amount;
			}
			else {
				juice = parseInt(juice.substring(1));
				var conversion = 1 / (juice / 100);
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
				var ret = calcWinnings(this.amount, juice)	
				$scope.pay = ret.pay;
				$scope.winnings = ret.winnings;
			}
			else {
				$scope.pay = '';
				$scope.winnings = '';
			}
		}
	}
]);

'use strict';

//Wagers service used for communicating with the wagers REST endpoints
angular.module('wagers').factory('Wagers', ['$resource',
	function($resource) {
		return $resource('wagers/:wagerId', {
			wagerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			placeWager: {
				method: 'PUT'
			},
		});
	}
]);
