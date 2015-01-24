'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Bank = mongoose.model('Bank'),
	_ = require('lodash');

/**
 * Show the current bank
 */
exports.read = function(req, res) {
	res.json(req.bank);
};

/**
 * Update a bank
 */
exports.update = function(req, res) {
	var bank = req.bank;

	bank = _.extend(bank, req.body);

	bank.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(bank);
		}
	});
};

/**
 * Bank middleware
 */
exports.bankByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Bank is invalid'
		});
	}

	Bank.findById(id).populate('commissioner', 'displayName').exec(function(err, bank) {
		if (err) return next(err);
		if (!bank) {
			return res.status(404).send({
  				message: 'Bank not found'
  			});
		}
		req.bank = bank;
		next();
	});
};

/**
 * Bank authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.bank.commissioner.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
