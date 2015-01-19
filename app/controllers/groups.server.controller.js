'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Group = mongoose.model('Group'),
	_ = require('lodash');

/**
 * Create a group
 */
exports.create = function(req, res) {
	var group = new Group(req.body);
	group.user = req.user;

	group.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(group);
		}
	});
};

/**
 * Show the current group
 */
exports.read = function(req, res) {
	res.json(req.group);
};

/**
 * Update a group
 */
exports.update = function(req, res) {
	var group = req.group;

	group = _.extend(group, req.body);

	group.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(group);
		}
	});
};

/**
 * Delete a group
 */
exports.delete = function(req, res) {
	var group = req.group;

	group.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(group);
		}
	});
};

/**
 * List of groups
 */
exports.list = function(req, res) {
	Group.find().sort('-created').populate('user', 'displayName').exec(function(err, groups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(groups);
		}
	});
};

/**
 * Group middleware
 */
exports.groupByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Group is invalid'
		});
	}

	Group.findById(id).populate('user', 'displayName').exec(function(err, group) {
		if (err) return next(err);
		if (!group) {
			return res.status(404).send({
  				message: 'Group not found'
  			});
		}
		req.group = group;
		next();
	});
};

/**
 * Group authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.group.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
