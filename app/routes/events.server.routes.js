'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	events = require('../../app/controllers/events.server.controller');

module.exports = function(app) {
	// Event Routes
	app.route('/events')
		.get(events.list);
	app.route('/events/groupId/:groupId')
		.get(events.listForGroup);


};

