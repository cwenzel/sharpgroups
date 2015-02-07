var BoardItem = require('../models/boardItem.server.model.js');
var querystring = require('querystring');
var inserter = require('./insertBoardItems');

var mongoose = require('mongoose'),
	BoardItem = mongoose.model('BoardItem'),
	_ = require('lodash'),
	http = require('http');

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

exports.insertBoardItems = function (rawCsv) {
	var rows = rawCsv.split('\r\n');
	var dateObject = new Date();
	var dateString = String(dateObject.getMonth() + 1) + String(dateObject.getDate()) + String(dateObject.getFullYear());

	ranTodaysBoardItems(dateString, function (ranTodayAlready) {
		if (ranTodayAlready) {
			console.log('Already ran for date ' + dateString);
		}
		else {
			runToday(rows, dateString);
		}
	});
}

// just in case we already ran the script today, always check to see if we already did this
function ranTodaysBoardItems(dateString, callback) {
	var seqZero = parseInt(dateString) * 10;
	seqZero++;
	BoardItem.find({'seq' : dateString}).exec(function (err, boardItem) {
		if (boardItem && boardItem.length > 0)
			callback(true);
		else
			callback(false);
	});
}

function runToday(rows, dateString) {
	var sport = '';
	var j = 0;
	var lastRow = {};
	var seq = 1;
	var grouping = 1;

	for (var i in rows) {
		var row = rows[i].split(',');
		var date = rows[i].split('/');
		if (date.length == 1 && row.length == 1) {
			sport = row[0];
			j = 0;
		}
		if (row.length > 4 && row[0] != 'Date') {
			var oddEntry = (j % 2 == 1);
			if (oddEntry) {
				if (row.length == 13 && lastRow.length == 13) {
					eventDate = lastRow[0] + row[0];
					var team1 = lastRow[2];
					var team2 = row[2];
				 	var spread1 = lastRow[4];
					var spread2 = row[4];
					var moneyLine1Juice = lastRow[5];
					var moneyLine2Juice = row[5];
					var total = parseFloat(row[6].split(' ')[1]);
					var thisGrouping = parseInt(dateString + grouping);
					var thisSeq = parseInt(dateString + seq);
					if (moneyLine1Juice.trim().length > 0) {
						// ML ONE
						var description = team1 + ' Moneyline';
						processRow({'sport' : sport, 'seq' : thisSeq++, 'grouping' : thisGrouping, 'description' : description, 'juice' : moneyLine1Juice, 'eventDate' : eventDate});
						seq++;
						// ML TWO
						description = team2 + ' Moneyline';
						processRow({'sport' : sport, 'seq' : thisSeq++, 'grouping' : thisGrouping, 'description' : description, 'juice' : moneyLine2Juice, 'eventDate' : eventDate});
						seq++;
					}
					if (spread1.length > 0) {
						// SPREAD ONE
						description = team1 + ' ' + spread1;
						processRow({'sport' : sport, 'seq' : thisSeq++, 'grouping' : thisGrouping, 'description' : description, 'spread' : spread1, 'juice' : '-110', 'eventDate' : eventDate});
						seq++;
						// SPREAD TWO
						description = team2 + ' ' + spread2;
						processRow({'sport' : sport, 'seq' : thisSeq++, 'grouping' : thisGrouping, 'description' : description, 'spread' : spread2, 'juice' : '-110', 'eventDate' : eventDate});
						seq++;
					}
					if (total > 0) {
						// OVER
						description = team1 + '-' + team2 + ' Over: ' + total;
						processRow({'sport' : sport, 'seq' : thisSeq++, 'grouping' : thisGrouping, 'description' : description, 'over' : true,  'total' : total, 'juice' : '-110', 'eventDate' : eventDate});
						seq++;
						// UNDER
						description = team1 + '-' + team2 + ' Under: ' + total;
						processRow({'sport' : sport, 'seq' : thisSeq++, 'grouping' : thisGrouping, 'description' : description, 'under' : true, 'total' : total, 'juice' : '-110', 'eventDate' : eventDate});
						seq++;
					}

					grouping++;
				}
			}
			j++;
			lastRow = row;
		}
	}
}

//Date, #, Team, Open, Spread, ML, Total, Bet#, Spread%, ML%, Total%, Exotics
//{"seq" : 22, "grouping" : 11, "sport" : "NFL", "description" : "SHORTEST MADE FIELD GOAL OF GAME UNDER25.5", "juice" : "+105 ", "expired" : false, "winner" : false }
function processRow (obj) {
	obj.expired = false;
	obj.winner = false;
	var boardItem = new BoardItem(obj);

	boardItem.save(function(err) {
		if (err) {
			console.log(err);
		}
	});
}
