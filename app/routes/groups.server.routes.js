'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	groups = require('../../app/controllers/groups.server.controller');

module.exports = function(app) {
	// Group Routes
	app.route('/groups')
		.get(groups.list)
		.post(users.requiresLogin, groups.create);

	app.route('/groups/:groupId')
		.get(groups.read)
	        .put(users.requiresLogin, groups.joinGroup)
		.put(users.requiresLogin, groups.hasAuthorization, groups.update)
		.post(users.requiresLogin, groups.update)
		.delete(users.requiresLogin, groups.hasAuthorization, groups.delete);

	app.route('/groups/getGroupUsersAndBankrolls/:groupId')
		.get(users.requiresLogin, groups.getGroupUsersAndBankrolls);

	// Finish by binding the group middleware
	app.param('groupId', groups.groupByID);
};
