'use strict';

var Score = require('../models/score.server.model.js');
var BoardItem = require('../models/boardItem.server.model.js');
var Wager = require('../models/wager.server.model.js');
var Bank = require('../models/bank.server.model.js');
var Team = require('../models/team.server.model.js');

var mongoose = require('mongoose'),
	BoardItem = mongoose.model('BoardItem'),
	Wager = mongoose.model('Wager'),
	Bank = mongoose.model('Bank'),
	Team = mongoose.model('Team'),
	Score = mongoose.model('Score');

var config = {db: {
		uri: 'mongodb://localhost/mean-dev',
		options: {
			user: '',
			pass: ''
		}
	}};

if (false) {
var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error('Could not connect to MongoDB!');
		console.log(err);
	}
});
}

exports.runScript = function() {
	Score.find({}).exec(function (err, scores) {
		handleScoresAndBoardItems(scores);
	});
	
	function handleScoresAndBoardItems(scores) {
		for (var s in scores) {
			findBoardItemsAndUpdate(scores[s]);
		}
	}
	function findBoardItemsAndUpdate(score) {
		scoreLineNameConverter(score.eventType, score.awayTeamName, function(awayTeam) {
			scoreLineNameConverter(score.eventType, score.homeTeamName, function(homeTeam) {
					var teams = [awayTeam, homeTeam];
					BoardItem.find({'processed' : false, 'teams' : {$all : teams}}).exec(function (err, boardItems) {
						updateBoardItemsWithScoreData(boardItems, score, awayTeam, homeTeam);
				});
			});
		});
	}
	
	function updateBoardItemsWithScoreData(boardItems, score, awayTeam, homeTeam) {
		for (var b in boardItems) {
			handleBoardItem(boardItems[b], score, awayTeam, homeTeam);
		}
	}
	
	function handleBoardItem(boardItem, score, awayTeam, homeTeam) {
		var spread = '';
		var overUnder = '';
		boardItem.processed = true;
		switch (boardItem.type) {
			case 'awayml' :
				if (score.awayTeamScore > score.homeTeamScore)
					boardItem.winner = true;
				break;
			case 'homeml' :
				if (score.homeTeamScore > score.awayTeamScore)
					boardItem.winner = true;
				break;
			case 'awayspread' :
				spread = parseFloat(boardItem.description.replace(awayTeam, ''));
				if (score.awayTeamScore + spread > score.homeTeamScore)
					boardItem.winner = true;
				if (score.awayTeamScore + spread === score.homeTeamScore)
					boardItem.push = true;
				break;
			case 'homespread' :
				spread = parseFloat(boardItem.description.replace(homeTeam, ''));
				if (score.homeTeamScore + spread > score.awayTeamScore)
					boardItem.winner = true;
				if (score.homeTeamScore + spread === score.awayTeamScore)
					boardItem.push = true;	
				break;
			case 'over' :
				overUnder = parseFloat(boardItem.description.replace(awayTeam + '-' + homeTeam + ' Over:', ''));
				if (score.awayTeamScore + score.homeTeamScore > overUnder)
					boardItem.winner = true;
				if (score.awayTeamScore + score.homeTeamScore === overUnder)
					boardItem.push = true;	
				break;
			case 'under' :
				overUnder = parseFloat(boardItem.description.replace(awayTeam + '-' + homeTeam + ' Under:', ''));
				if (score.awayTeamScore + score.homeTeamScore < overUnder)
					boardItem.winner = true;
				if (score.awayTeamScore + score.homeTeamScore === overUnder)
					boardItem.push = true;
				break;
			default :
				boardItem.processed = false;
				console.log('No type information can not handle board item');
				break;
		}
		boardItem.save(function (err, product, numberAffected) {
			if (err)
				console.log('ERROR: ' + err);
			if (boardItem.winner)
				updateWagersForWinningBoardItem(boardItem);
		});
	}
	
	function updateWagersForWinningBoardItem(boardItem) {
		Wager.find({'boardItem' : boardItem._id}).exec(function (err, wagers) {
			for (var w in wagers) {
				updateBankForWinningWager(wagers[w], calcWinnings(wagers[w].amount, boardItem.juice).pay);
			}
		});
	}
	
	function updateBankForWinningWager(wager, winnings) {
		Bank.find({'user' : wager.user, 'group' : wager.group}).exec(function (err, banks) {
			// this query should only ever return one bank
			banks[0].amount = parseFloat(winnings) + parseFloat(banks[0].amount);
			banks[0].save();
		});
	}
	
	function calcWinnings (amount, juice) {
		juice = juice.toString();
		juice = juice.trim();
		var slashPosition = juice.indexOf('/');
		var winnings = 0;
		var conversion = 0;
	
		if (juice === 'EVEN') {
			winnings = amount;
		}
		else if (slashPosition > 0) {
			var numerator = juice.split('/')[0];
			var denominator = juice.split('/')[1];
			var theOdds = parseFloat(numerator / denominator);
			console.log(theOdds);
			winnings = amount * theOdds;
		}
		else if (juice[0] === '+') {
			juice = parseInt(juice);
			conversion = juice / 100;
			winnings = conversion * amount;
		}
		else {
			juice = parseInt(juice.substring(1));
			conversion = 1 / (juice / 100);
			winnings = conversion * amount;
		}
	
		var pay =  amount + winnings;
		pay = parseFloat(pay).toFixed(2);
		winnings = parseFloat(winnings).toFixed(2);
	
		return {'pay' : pay, 'winnings' : winnings};
	}
	
	
	function scoreLineNameConverter(eventType, teamName, callback) {
		Team.find({'eventType' : {$in : [eventType]}, 'alternateName' : teamName}, function(err, team) {
			if (team && team.length === 1) {
				callback(team[0].name);
			}
			else if (team && team.length === 0) {
				// for now if the name isn't in the db just assume that there isn't any mapping needed
				callback(teamName);
			}
			else {
				console.log('ERROR: found team twice');
				callback(teamName);
			}
		});
	}
};

