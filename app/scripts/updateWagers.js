var Score = require('../models/score.server.model.js');
var BoardItem = require('../models/boardItem.server.model.js');


var mongoose = require('mongoose'),
	BoardItem = mongoose.model('BoardItem'),
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
	var teams = [score.awayTeamName, score.homeTeamName];
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
	// 6 possible descriptions
	var away = scoreLineNameConverter(score.awayTeamName);
	var home = scoreLineNameConverter(score.homeTeamName);
	switch (boardItem.type) {
		case 'awayml' :
			if (score.awayTeamScore > score.homeTeamScore)
				console.log('winner for awayml');
			break;
		case 'homeml' :
			if (score.homeTeamScore > score.awayTeamScore)
				console.log('winner for homeml');
			break;
		case 'awayspread' :
			var spread = parseFloat(boardItem.description.replace(away, ''));
			if (score.awayTeamScore + spread > score.homeTeamScore)
				console.log('winner for awayspread');
			break;
		case 'homespread' :
			var spread = parseFloat(boardItem.description.replace(home, ''));
			if (score.homeTeamScore + spread > score.awayTeamScore)
				console.log('winner for homespread');
			break;
		case 'over' :
			var overUnder = parseFloat(boardItem.description.replace(away + '-' + home + ' Over:', ''));
			if (score.awayTeamScore + score.homeTeamScore > overUnder)
				console.log('winner for over');
			break;
		case 'under' :
			var overUnder = parseFloat(boardItem.description.replace(away + '-' + home + ' Under:', ''));
			if (score.awayTeamScore + score.homeTeamScore < overUnder)
				console.log('winner for under');
			break;
		default :
//			console.log('No type information can not handle board item');
			break;
	}	
}

function scoreLineNameConverter(teamName) {
	return teamName;
}
