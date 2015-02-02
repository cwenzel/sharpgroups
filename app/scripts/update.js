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

/*
Wager.find({"group" : "54c8418638a5d7ad22adb062" }, function (err, wagers) {
	var boardItemIds = [];
	for (var i in wagers) {
		boardItemIds.push(wagers[i].boardItem);
	}
	getBoardItems(boardItemIds, function (boardItems) {
		console.log(boardItems);
	});
});*/


BoardItem.find({"winner" : true}, function (err, boardItems) {
	for (var i in boardItems) {	
		Wager.find({'boardItem' : boardItems[i]._id}, function (err, wagers) {
			for (var j in wagers) {
				var juice = '';
				for (var x in boardItems) {
					if (boardItems[x]._id.toString() == wagers[j].boardItem.toString()) {
						juice = boardItems[x].juice;
					}
				}
				juice = juice.trim();
				var slashPosition = juice.indexOf('/');
				var winnings = 0;
	
				if (juice === 'EVEN') {
					winnings = wagers[j].amount;
				}
				else if (slashPosition > 0) {
					var numerator = juice.split('/')[0];
					var denominator = juice.split('/')[1];
					var theOdds = parseFloat(numerator / denominator);
					console.log(theOdds);
					winnings = wagers[j].amount * theOdds;
				}
				else if (juice[0] == '+') {
					juice = parseInt(juice);
					var conversion = juice / 100;
					winnings = conversion * wagers[j].amount;
				}
				else {
					juice = parseInt(juice.substring(1));
					var conversion = 1 / (juice / 100);
					winnings = conversion * wagers[j].amount;
				}
	
				var pay =  wagers[j].amount + winnings;
				if (wagers[j].user.toString() == "54cd4469386e7cc47193d945")
					console.log(wagers[j].boardItem +' : '  + pay);

//				Bank.update({'user': wagers[j].user, 'group' : '54c8418638a5d7ad22adb062'}, {$inc : {'amount' : pay}}, function (err) {
//					console.log(err);
//				});
			}
		});
	}
});
