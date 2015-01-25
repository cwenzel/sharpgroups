'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Event = mongoose.model('Event'),
	_ = require('lodash');


/**
 * List of events
 */
exports.list = function(req, res) {
	Event.find().exec(function(err, events) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(events);
		}
	});
};

exports.listForGroup = function(req, res) {
	Event.find({'_id' : { $in : req.group.events}}).exec(function(err, events) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(events);
		}
	});

};
