'use strict';

/**
 * Module dependencies.
 */
var Bank = require('../models/bank.server.model.js');
var Wager = require('../models/wager.server.model.js');
var BoardItem = require('../models/boardItem.server.model.js');
var Group = require('../models/group.server.model.js');

var mongoose = require('mongoose'),
	Wager = mongoose.model('Wager'),
	Bank = mongoose.model('Bank'),
	BoardItem = mongoose.model('BoardItem'),
	Group = mongoose.model('Group'),
	_ = require('lodash');

var config = {db: {
		uri: 'mongodb://localhost/mean-dev',
		options: {
			user: '',
			pass: ''
		}
	}};


var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

function getBoardItems(boardItemIds, callback) {
	BoardItem.find({'_id' : {'$in' : boardItemIds}}).exec(function(err, boardItems) {
		callback(boardItems);
	});
}

function getUserBankInfo(userQueryArray, callback) {
	User.find({'_id' : {'$in' : userQueryArray}}).exec(function (err, users) {
		callback(users);
	});
}


Wager.find({"group" : "54c56f9a2c69f6f732d3f0df" }, function (err, wagers) {
	var boardItemIds = [];
	for (var i in wagers) {
		boardItemIds.push(wagers[i].boardItem);
	}
	getBoardItems(boardItemIds, function (boardItems) {
		console.log(boardItems);
	});
});
