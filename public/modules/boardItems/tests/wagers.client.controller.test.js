'use strict';

(function() {
	// Wagers Controller Spec
	describe('WagersController', function() {
		// Initialize global variables
		var WagersController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Wagers controller.
			WagersController = $controller('WagersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one wager object fetched from XHR', inject(function(Wagers) {
			// Create sample wager using the Wagers service
			var sampleWager = new Wagers({
				title: 'An Wager about MEAN',
				description: 'MEAN rocks!'
			});

			// Create a sample wagers array that includes the new wager
			var sampleWagers = [sampleWager];

			// Set GET response
			$httpBackend.expectGET('wagers').respond(sampleWagers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.wagers).toEqualData(sampleWagers);
		}));

		it('$scope.findOne() should create an array with one wager object fetched from XHR using a wagerId URL parameter', inject(function(Wagers) {
			// Define a sample wager object
			var sampleWager = new Wagers({
				title: 'An Wager about MEAN',
				description: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.wagerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/wagers\/([0-9a-fA-F]{24})$/).respond(sampleWager);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.wager).toEqualData(sampleWager);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Wagers) {
			// Create a sample wager object
			var sampleWagerPostData = new Wagers({
				title: 'An Wager about MEAN',
				description: 'MEAN rocks!'
			});

			// Create a sample wager response
			var sampleWagerResponse = new Wagers({
				_id: '525cf20451979dea2c000001',
				title: 'An Wager about MEAN',
				description: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Wager about MEAN';
			scope.description = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('wagers', sampleWagerPostData).respond(sampleWagerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.description).toEqual('');

			// Test URL redirection after the wager was created
			expect($location.path()).toBe('/wagers/' + sampleWagerResponse._id);
		}));

		it('$scope.update() should update a valid wager', inject(function(Wagers) {
			// Define a sample wager put data
			var sampleWagerPutData = new Wagers({
				_id: '525cf20451979dea2c000001',
				title: 'An Wager about MEAN',
				description: 'MEAN Rocks!'
			});

			// Mock wager in scope
			scope.wager = sampleWagerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/wagers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/wagers/' + sampleWagerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid wagerId and remove the wager from the scope', inject(function(Wagers) {
			// Create new wager object
			var sampleWager = new Wagers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new wagers array and include the wager
			scope.wagers = [sampleWager];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/wagers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleWager);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.wagers.length).toBe(0);
		}));
	});
}());
