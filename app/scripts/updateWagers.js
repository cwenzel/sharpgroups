var Score = require('../models/score.server.model.js');
var BoardItem = require('../models/boardItem.server.model.js');
var Wager = require('../models/wager.server.model.js');
var Bank = require('../models/bank.server.model.js');

var mongoose = require('mongoose'),
	BoardItem = mongoose.model('BoardItem'),
	Wager = mongoose.model('Wager'),
	Bank = mongoose.model('Bank'),
	Score = mongoose.model('Score');

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

Score.find({}).exec(function (err, scores) {
	handleScoresAndBoardItems(scores);
});

function handleScoresAndBoardItems(scores) {
        for (var s in scores) {
		findBoardItemsAndUpdate(scores[s]);
	}
}
function findBoardItemsAndUpdate(score) {
	var teams = [scoreLineNameConverter(score.awayTeamName), scoreLineNameConverter(score.homeTeamName)];
	BoardItem.find({'processed' : false, 'teams' : {$all : teams}}).exec(function (err, boardItems) {
		updateBoardItemsWithScoreData(boardItems, score);
	});
}

function updateBoardItemsWithScoreData(boardItems, score) {
	for (var b in boardItems) {
		handleBoardItem(boardItems[b], score);
	}
}

function handleBoardItem(boardItem, score) {
	var away = scoreLineNameConverter(score.awayTeamName);
	var home = scoreLineNameConverter(score.homeTeamName);
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
			var spread = parseFloat(boardItem.description.replace(away, ''));
			if (score.awayTeamScore + spread > score.homeTeamScore)
				boardItem.winner = true;
			break;
		case 'homespread' :
			var spread = parseFloat(boardItem.description.replace(home, ''));
			if (score.homeTeamScore + spread > score.awayTeamScore)
				boardItem.winner = true;
			break;
		case 'over' :
			var overUnder = parseFloat(boardItem.description.replace(away + '-' + home + ' Over:', ''));
			if (score.awayTeamScore + score.homeTeamScore > overUnder)
				boardItem.winner = true;
			break;
		case 'under' :
			var overUnder = parseFloat(boardItem.description.replace(away + '-' + home + ' Under:', ''));
			if (score.awayTeamScore + score.homeTeamScore < overUnder)
				boardItem.winner = true;
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
	else if (juice[0] == '+') {
		juice = parseInt(juice);
		var conversion = juice / 100;
		winnings = conversion * amount;
	}
	else {
		juice = parseInt(juice.substring(1));
		var conversion = 1 / (juice / 100);
		winnings = conversion * amount;
	}

	var pay =  amount + winnings;
	pay = parseFloat(pay).toFixed(2);
	winnings = parseFloat(winnings).toFixed(2);

	return {'pay' : pay, 'winnings' : winnings};
}


function scoreLineNameConverter(teamName) {
	switch (teamName) {
		case 'Florida St' :
			return 'Florida St.';
	}
	return teamName;
}
