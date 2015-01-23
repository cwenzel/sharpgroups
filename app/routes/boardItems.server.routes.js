'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	boardItems = require('../../app/controllers/boardItems.server.controller');

module.exports = function(app) {
	// BoardItem Routes
	app.route('/boardItems')
		.get(boardItems.list);

	app.route('/boardItems/:boardItemId')
		.get(boardItems.read);

	// Finish by binding the boardItem middleware
	app.param('boardItemId', boardItems.boardItemByID);
};
