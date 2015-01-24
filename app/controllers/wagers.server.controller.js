'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Wager = mongoose.model('Wager'),
	Bank = mongoose.model('Bank'),
	_ = require('lodash');

/**
 * Updates the bankroll of the user who placed the wager
 * Returns an error string if the user doesn't have the dough
 */
function updateBankroll(groupId, userId, betAmount, callback) {
	Bank.find({'group' : groupId, 'user' : userId}).exec(function (err, bank) {
		bank = bank[0];
		var newBankAmount = bank.amount - betAmount;

		if (newBankAmount < 0) {
			callback('Not enough sharps for wager');
		}
		else {
			bank.amount = newBankAmount;
			bank.save();
			callback();
		}
	});
}

/**
 * Create a wager
 */
exports.create = function(req, res) {
	var wager = new Wager(req.body);
	wager.user = req.user;

	updateBankroll(wager.group, wager.user, wager.amount, function placeWager(err) {
		if (err) {
			return res.status(400).send({
				message: err
			});
		} else {
			wager.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.json(wager);
				}
			});
		}
	});
};

/**
 * Show the current wager
 */
exports.read = function(req, res) {
	res.json(req.wager);
};

/**
 * List of wagers
 */
exports.list = function(req, res) {
	Wager.find({}, function (err, wagers) {
        	res.json(wagers);
    	});
};

/**
 * Wager middleware
 */
exports.wagerByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Wager is invalid'
		});
	}

	Wager.findById(id).populate('commissioner', 'displayName').exec(function(err, wager) {
		if (err) return next(err);
		if (!wager) {
			return res.status(404).send({
  				message: 'Wager not found'
  			});
		}
		req.wager = wager;
		next();
	});
};

/**
 * Wager authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.wager.commissioner.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};