'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Group = mongoose.model('Group'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, group;

/**
 * Group routes tests
 */
describe('Group CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new group
		user.save(function() {
			group = {
				title: 'Group Title',
				content: 'Group Content'
			};

			done();
		});
	});

	it('should be able to save an group if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new group
				agent.post('/groups')
					.send(group)
					.expect(200)
					.end(function(groupSaveErr, groupSaveRes) {
						// Handle group save error
						if (groupSaveErr) done(groupSaveErr);

						// Get a list of groups
						agent.get('/groups')
							.end(function(groupsGetErr, groupsGetRes) {
								// Handle group save error
								if (groupsGetErr) done(groupsGetErr);

								// Get groups list
								var groups = groupsGetRes.body;

								// Set assertions
								(groups[0].user._id).should.equal(userId);
								(groups[0].title).should.match('Group Title');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save an group if not logged in', function(done) {
		agent.post('/groups')
			.send(group)
			.expect(401)
			.end(function(groupSaveErr, groupSaveRes) {
				// Call the assertion callback
				done(groupSaveErr);
			});
	});

	it('should not be able to save an group if no title is provided', function(done) {
		// Invalidate title field
		group.title = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new group
				agent.post('/groups')
					.send(group)
					.expect(400)
					.end(function(groupSaveErr, groupSaveRes) {
						// Set message assertion
						(groupSaveRes.body.message).should.match('Title cannot be blank');
						
						// Handle group save error
						done(groupSaveErr);
					});
			});
	});

	it('should be able to update an group if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new group
				agent.post('/groups')
					.send(group)
					.expect(200)
					.end(function(groupSaveErr, groupSaveRes) {
						// Handle group save error
						if (groupSaveErr) done(groupSaveErr);

						// Update group title
						group.title = 'WHY YOU GOTTA BE SO MEAN?';

						// Update an existing group
						agent.put('/groups/' + groupSaveRes.body._id)
							.send(group)
							.expect(200)
							.end(function(groupUpdateErr, groupUpdateRes) {
								// Handle group update error
								if (groupUpdateErr) done(groupUpdateErr);

								// Set assertions
								(groupUpdateRes.body._id).should.equal(groupSaveRes.body._id);
								(groupUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of groups if not signed in', function(done) {
		// Create new group model instance
		var groupObj = new Group(group);

		// Save the group
		groupObj.save(function() {
			// Request groups
			request(app).get('/groups')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single group if not signed in', function(done) {
		// Create new group model instance
		var groupObj = new Group(group);

		// Save the group
		groupObj.save(function() {
			request(app).get('/groups/' + groupObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('title', group.title);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should return proper error for single group which doesnt exist, if not signed in', function(done) {
		request(app).get('/groups/test')
			.end(function(req, res) {
				// Set assertion
				res.body.should.be.an.Object.with.property('message', 'Group is invalid');

				// Call the assertion callback
				done();
			});
	});

	it('should be able to delete an group if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new group
				agent.post('/groups')
					.send(group)
					.expect(200)
					.end(function(groupSaveErr, groupSaveRes) {
						// Handle group save error
						if (groupSaveErr) done(groupSaveErr);

						// Delete an existing group
						agent.delete('/groups/' + groupSaveRes.body._id)
							.send(group)
							.expect(200)
							.end(function(groupDeleteErr, groupDeleteRes) {
								// Handle group error error
								if (groupDeleteErr) done(groupDeleteErr);

								// Set assertions
								(groupDeleteRes.body._id).should.equal(groupSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete an group if not signed in', function(done) {
		// Set group user 
		group.user = user;

		// Create new group model instance
		var groupObj = new Group(group);

		// Save the group
		groupObj.save(function() {
			// Try deleting group
			request(app).delete('/groups/' + groupObj._id)
			.expect(401)
			.end(function(groupDeleteErr, groupDeleteRes) {
				// Set message assertion
				(groupDeleteRes.body.message).should.match('User is not logged in');

				// Handle group error error
				done(groupDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Group.remove().exec();
		done();
	});
});
