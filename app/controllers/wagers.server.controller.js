'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Wager = mongoose.model('Wager'),
	Bank = mongoose.model('Bank'),
	BoardItem = mongoose.model('BoardItem'),
	Group = mongoose.model('Group'),
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

function getGroup(groupId, callback) {
	Group.findById(groupId).exec(function (err, group) {
		callback(group);
	});
}

function findExistingWager(groupId, userId, boardItemId, callback) {
	Wager.find({'group' : groupId, 'user' : userId, 'boardItem' : boardItemId}, function (err, wager) {
		callback(wager);	
	});
}

function getBoardItems(boardItemIds, callback) {
	BoardItem.find(boardItemIds).exec(function(err, boardItems) {
		callback(boardItems);
	});
}


/**
 * Create a wager
 */
exports.create = function(req, res) {
	var wager = new Wager(req.body);
	wager.user = req.user;

	if (wager.amount < 1)
		return res.status(400).send({message: 'Wager can not be negative'});
	
	findExistingWager(wager.group, wager.user, wager.boardItem, function(existingWager) {
		if (existingWager.length !== 0)
			return res.status(400).send({message: 'You are not allowed to place the same wager twice'});

		getBoardItems({'_id' : wager.boardItem}, function (boardItems) {
			var now = new Date();
			if (now > boardItems[0].eventDate)
				return res.status(400).send({message: 'This wager is expired, please try another wager'});

			getGroup(wager.group, function (group) {
				if (wager.amount > group.maxBet)
					return res.status(400).send({message: 'The max bet is: ' + group.maxBet});
	
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
			});
		});
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
	var publicMode = req.query.publicUserId ? true : false;
	var user = publicMode ? req.query.publicUserId : req.user;

	Wager.find({'user' : user, 'group' : req.query.group}).populate('boardItem').exec(function (err, wagers) {
		var returnArray = [];
		for (var i in wagers) {
			if (!publicMode || wagers[i].boardItem.processed || wagers[i].boardItem.eventDate < new Date())
				returnArray.push({'_id' : wagers[i]._id, 'amount' : wagers[i].amount, 'boardItem' : wagers[i].boardItem, 'groupId' : wagers[i].group});
		}
		returnArray.sort(function (a,b) {
			if (a.boardItem.eventDate > b.boardItem.eventDate)
				return -1;
			return 1;
		});
		res.json(returnArray);
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
