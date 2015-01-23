'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	BoardItem = mongoose.model('BoardItem'),
	_ = require('lodash');


/**
 * Show the current boardItem
 */
exports.read = function(req, res) {
	res.json(req.boardItem);
};

/**
 * Delete a boardItem
 */
exports.delete = function(req, res) {
	var boardItem = req.boardItem;

	boardItem.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(boardItem);
		}
	});
};

/**
 * List of boardItems
 */
exports.list = function(req, res) {
	BoardItem.find({}, function (err, boardItems) {
        	res.json(boardItems);
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
