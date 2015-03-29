'use strict';

var querystring = require('querystring');
var http = require('http');
var Score = require('../models/score.server.model.js');
var EventCollection = require('../models/event.server.model.js');

var mongoose = require('mongoose'),
    	EventCollection = mongoose.model('Event'),
	Score = mongoose.model('Score');

function processGame(eventType, awayTeam, homeTeam, awayScore, homeScore) {
	var obj = {'homeTeamName' : homeTeam, 'awayTeamName' : awayTeam, 'homeTeamScore' : homeScore, 'awayTeamScore' : awayScore, 'eventType' : eventType};
//	console.log(obj);
	Score.find(obj).exec(function (err, s) {
		if (err)
			console.log('err ' + err);
		if (s && s.length > 0) {
			//console.log('already entered:');
			//console.log(obj);
		}
		else {
			var score = new Score(obj);

			score.save(function(err) {
				if (err) {
					console.log(err);
				}
			});
		}
	});
}

function parseSport(eventType, doc) {
	var statusLines, awayNames, homeNames, awayScores, homeScores;
	var i = 0;
	var j = 0;
	var awayScore, homeScore, awayTeam, homeTeam;

	if (eventType.alternateTitle === 'mlb' || eventType.alternateTitle == 'nba') {
		awayNames = doc.match(/aTeamName"><a href="(\w|\.|\/|:|-)*">(-|\w|\s|:|\d|;|&)*<\/a>/g);
		homeNames = doc.match(/hTeamName"><a href="(\w|\.|\/|:|-)*">(-|\w|\s|:|\d|;|&)*<\/a>/g);
		awayScores = doc.match(/aScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">[0-9]*<\/li>/g);
		homeScores = doc.match(/hScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">[0-9]*<\/li>/g);
		statusLines = doc.match(/statusLine1">(-|\w|\s|:|\d|;|&)*<\/p>/g);
		for (i in awayNames) {
			if (statusLines[i] && statusLines[i].indexOf('ET') === -1) {
				if (awayScores[j] && homeScores[j] &&  homeNames[i] && awayNames[i]) {
					awayScore = parseInt(awayScores[j].replace(/aScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">/g, '').replace('</li>', ''));
					homeScore = parseInt(homeScores[j].replace(/hScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">/g, '').replace('</li>', ''));
					awayTeam = awayNames[i].replace(/aTeamName"><a href="(\w|\.|\/|:|-)*">/g, '').replace('</a>', '');
					homeTeam = homeNames[i].replace(/hTeamName"><a href="(\w|\.|\/|:|-)*">/g, '').replace('</a>', '');
					if (statusLines[i].indexOf('Final') > -1) {
						processGame(eventType, awayTeam, homeTeam, awayScore, homeScore);
					}
					j++;
				}
			}
		}	
	}
	else if (eventType.alternateTitle === 'nhl') {
		awayNames = doc.match(/awayHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">(\w)*<\/a>/g);
		homeNames = doc.match(/homeHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">(\w)*<\/a>/g);
		awayScores = doc.match(/awayHeaderScore">(\d)*<\/span>/g);
		homeScores = doc.match(/homeHeaderScore">(\d)*<\/span>/g);
		statusLines = doc.match(/statusLine1" style="text-indent: 5px;">(-|\w|\s|:|\d|;|&)*<\/li>/g);
		for (i in awayNames) {
			if (statusLines[i] && statusLines[i].indexOf('ET') === -1) {
				if (awayScores[j] && homeScores[j] &&  homeNames[i] && awayNames[i]) {
					awayScore = parseInt(awayScores[j].replace('awayHeaderScore">', '').replace('</span>', ''));
					homeScore = parseInt(homeScores[j].replace('homeHeaderScore">', '').replace('</span>', ''));
					awayTeam = awayNames[i].replace(/awayHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">/g, '').replace('</a>', '');
					homeTeam = homeNames[i].replace(/homeHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">/g, '').replace('</a>', '');
					if (statusLines[i].indexOf('Final') > -1) {
						processGame(eventType, awayTeam, homeTeam, awayScore, homeScore);
					}
					j++;
				}
			}
		}
	}
	else {
		awayNames = doc.match(/aTeamName"><a title="(&|\w|\s|-|\(|\)|\.|')*"/g);
		homeNames = doc.match(/hTeamName"><a title="(&|\w|\s|-|\(|\)|\.|')*"/g);
		awayScores = doc.match(/awayHeaderScore">[0-9]*<\/li>/g);
		homeScores = doc.match(/homeHeaderScore">[0-9]*<\/li>/g);
		statusLines = doc.match(/statusLine1">(-|\w|\s|:|\d|;|&)*<\/p>/g);
		for (i in awayScores) {
			if (awayScores[i] && homeScores[i] && homeNames[i] && awayNames[i]) {
				awayScore = parseInt(awayScores[i].replace('awayHeaderScore">', '').replace('</li>', ''));
				homeScore = parseInt(homeScores[i].replace('homeHeaderScore">', '').replace('</li>', ''));
				awayTeam = awayNames[i].replace('aTeamName"><a title="', '').replace('"', '');
				homeTeam = homeNames[i].replace('hTeamName"><a title="', '').replace('"', '');

				if (statusLines[i].indexOf('Final') > -1) {
					processGame(eventType, awayTeam, homeTeam, awayScore, homeScore);
				}
			}
		}
	}
}

function makeRequest(options, eventType) {
	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  var body = '';
	  res.on('data', function (chunk) {
	      body += chunk;
	  });
	  res.on('end', function() {
		//write body to a tmp file for debugging
		var fs = require('fs');
		fs.writeFile(eventType.alternateTitle+'.tmp', body, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log('The file was saved!');
		    }
		}); 
		parseSport(eventType, body);
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	req.write('data');
	req.end();
}

exports.runScript = function(scriptRunner) {
	if (scriptRunner) {
		var config = {db: {
			uri: 'mongodb://localhost/mean-dev',
			options: {
				user: '',
				pass: ''
			}
		}};


		var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
			if (err) {
				console.error('Could not connect to MongoDB!');
				console.log(err);
			}
		});
	}

	EventCollection.find({'seasonStart' : {$lt : new Date()}, 'seasonEnd' : {$gt : new Date()}}, function(err, events) {
		var today = new Date();
		today = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
		var options, path;

		for (var i in events) {
			path = '/' + events[i].alternateTitle + '/scoreboard';
			options = {
		 		host: 'scores.espn.go.com',
				port: 80,
				path: path,
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36'
				}
			};	
			makeRequest(options, events[i]);
		}
	});
};
