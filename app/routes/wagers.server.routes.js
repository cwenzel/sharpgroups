'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	wagers = require('../../app/controllers/wagers.server.controller');

module.exports = function(app) {
	// Wager Routes
	app.route('/wagers')
		.get(wagers.list);

	app.route('/wagers/:wagerId')
		.get(wagers.read)
                .put(users.requiresLogin, wagers.placeWager);

	// Finish by binding the wager middleware
	app.param('wagerId', wagers.wagerByID);
};
