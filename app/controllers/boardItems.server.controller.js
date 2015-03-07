'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	BoardItem = mongoose.model('BoardItem'),
	EventCollection = mongoose.model('Event'),
	_ = require('lodash');


/**
 * Show the current boardItem
 */
exports.read = function(req, res) {
	res.json(req.boardItem);
};

/**
 * List of boardItems
 */
exports.list = function(req, res) {
	EventCollection.findById(req.query.eventId, function (err, ev) {
		BoardItem.find({'sport' : ev.title, 'expired' : false, 'eventDate' : {$gt : new Date()}}).sort('seq').exec(function (err, boardItems) {
			res.json(boardItems);
	    	});
	});
};

/**
 * BoardItem middleware
 */
exports.boardItemByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'BoardItem is invalid'
		});
	}

	BoardItem.findById(id).populate('commissioner', 'displayName').exec(function(err, boardItem) {
		if (err) return next(err);
		if (!boardItem) {
			return res.status(404).send({
  				message: 'BoardItem not found'
  			});
		}
		req.boardItem = boardItem;
		next();
	});
};

/**
 * BoardItem authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.boardItem.commissioner.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
