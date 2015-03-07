'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Group = mongoose.model('Group'),
	Bank = mongoose.model('Bank'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a group
 */
exports.create = function(req, res) {
	var group = new Group(req.body);
	group.commissioner = req.user;


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


function getUserBankrollAmount(groupId, userId, callback) {
	Bank.find({'group' : groupId, 'user' : userId}).lean().exec(function (err, bank) {
		bank = bank[0];
		callback(parseFloat(bank.amount).toFixed(2));
	});
}

function getUserBankInfo(userQueryArray, callback) {
	User.find({'_id' : {'$in' : userQueryArray}}).exec(function (err, users) {
		callback(users);
	});
}

exports.getGroupUsersAndBankrolls = function(req, res) {
	var output = [];
	Bank.find({'group' : req.group._id}).lean().exec(function (err, banks) {
		var userQueryArray = [];
		var total = 0;
		for(var b in banks) {
			userQueryArray.push(banks[b].user);
			total += banks[b].amount;
		}

		getUserBankInfo(userQueryArray, function (users) {
			for (var i in users) {
				var percentage = (parseFloat(banks[i].amount/total) * 100).toFixed(2);
				output.push({'userId' : users[i]._id, 'amount' : parseFloat(banks[i].amount).toFixed(2), 'displayName' : users[i].displayName, 'percentage' : percentage});
			}
			
			output.sort(function (a, b) {
				return parseFloat(b.amount) - parseFloat(a.amount);
			});

			res.json(output);
		});
	});
};

/**
 * Show the current group
 */
exports.read = function(req, res) {
	var userInGroup = (req.group.players.indexOf(req.user._id) >= 0);
	req.group.set('userInGroup', userInGroup);

	if (userInGroup) {
		getUserBankrollAmount(req.group, req.user, function(amount){
			req.group.set('userBankroll', amount);
			res.json(req.group);
		});
	}
	else {
		res.json(req.group);
	}
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
	Group.find({$or : [{'players' : {$in : [req.user]}}, {'endDate' : {$gt : new Date()}}]}).sort('-created').populate('commissioner', 'displayName').exec(function(err, groups) {
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

	Group.findById(id).populate('commissioner', 'displayName').exec(function(err, group) {
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

function setUpBankroll(groupId, userId, callback) {
	Group.findById(groupId).lean().exec(function (err, group) {
		var bank = new Bank();
		bank.user = userId;
		bank.group = group._id;
		bank.amount = group.bankroll;
		bank.save();
		callback(bank.amount);
	});
}

exports.joinGroup = function(req, res, next) {
	
	var group = req.group;
	group = _.extend(group, req.body);
	group.players.push(req.user);
	group.set('userInGroup', true);
	setUpBankroll(req.group, req.user, function(userBankrollAmount){
		group.set('userBankroll', userBankrollAmount);

		group.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(group);
			}
		});
	});
};

/**
 * Group authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.group.commissioner.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
