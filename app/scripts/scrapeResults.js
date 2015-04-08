'use strict';

var querystring = require('querystring');
var http = require('http');
var Score = require('../models/score.server.model.js');
var EventCollection = require('../models/event.server.model.js');

var mongoose = require('mongoose'),
    	EventCollection = mongoose.model('Event'),
	Score = mongoose.model('Score');

function processGame(obj, callback) {
	Score.find(obj).exec(function (err, s) {
		if (err)
			callback();
		if (s && s.length > 0) {
			console.log('already entered:');
			console.log(obj);
			callback();
		}
		else {
			var score = new Score(obj);

			score.save(function(err) {
				if (err) {
					console.log(err);
				}
				callback();
			});
		}
	});
}

function processScores(scores, i, callback) {
	if (i < scores.length) {
		processGame(scores[i], function() {
			processScores(scores, ++i, callback);
		});
	}
	else {
		callback();
	}
}

function processPage(eventType, obj, doc, callback) {
	var i = 0;
	var j = 0;
	var scores = [];
	var awayScore, homeScore, awayTeam, homeTeam;
	
	var awayNames = doc.match(obj.awayTeamRegex);
	var homeNames = doc.match(obj.homeTeamRegex);
	var awayScores = doc.match(obj.awayScoreRegex);
	var homeScores = doc.match(obj.homeScoreRegex);
	var statusLines = doc.match(obj.statusLineRegex);
	for (i in awayNames) {
		if (statusLines && statusLines[i] && statusLines[i].indexOf('ET') === -1) {
			if (awayScores[j] && homeScores[j] &&  homeNames[i] && awayNames[i]) {
				awayScore = parseInt(awayScores[j].replace(obj.awayScoreRegexBegin, '').replace(obj.scoreEndTag, ''));
				homeScore = parseInt(homeScores[j].replace(obj.homeScoreRegexBegin, '').replace(obj.scoreEndTag, ''));
				awayTeam = awayNames[i].replace(obj.awayTeamRegexBegin, '').replace(obj.teamEndTag, '');
				homeTeam = homeNames[i].replace(obj.homeTeamRegexBegin, '').replace(obj.teamEndTag, '');
				if (statusLines[i].indexOf('Final') > -1) {
					scores.push({'eventType' : eventType, 'homeTeamName' : homeTeam, 'awayTeamName' : awayTeam, 'homeTeamScore' : homeScore, 'awayTeamScore' : awayScore });
				}
				j++;
			}
		}
	}
	if (scores.length > 0) {
		processScores(scores, 0, function() {
			callback();
		});
	}
	else {
		callback();
	}
}

function parseSport(eventType, doc, callback) {
	var inputObj = {};
	if (eventType.alternateTitle === 'mlb' || eventType.alternateTitle === 'nba') {
		inputObj.awayTeamRegex = /aTeamName"><a href="(\w|\.|\/|:|-)*">(-|\w|\s|:|\d|;|&)*<\/a>/g;
		inputObj.homeTeamRegex = /hTeamName"><a href="(\w|\.|\/|:|-)*">(-|\w|\s|:|\d|;|&)*<\/a>/g;
		inputObj.awayScoreRegex = /aScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">[0-9]*<\/li>/g;
		inputObj.homeScoreRegex = /hScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">[0-9]*<\/li>/g;
		inputObj.statusLineRegex = /statusLine1">(-|\w|\s|:|\d|;|&)*<\/p>/g;
		inputObj.awayScoreRegexBegin = /aScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">/g;
		inputObj.homeScoreRegexBegin = /hScores" class="score" style="display:(\s)*block(;)*">(&|\w|\s|-|\(|\)|\.|'|<|>|\\|;|"|'|=|\/)*class="finalScore">/g;
		inputObj.awayTeamRegexBegin = /aTeamName"><a href="(\w|\.|\/|:|-)*">/g;
		inputObj.homeTeamRegexBegin = /hTeamName"><a href="(\w|\.|\/|:|-)*">/g;
		inputObj.scoreEndTag = '</li>';
		inputObj.teamEndTag = '</a>';
	}
	else if (eventType.alternateTitle === 'nhl') {
		inputObj.awayNameRegex = /awayHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">(\w)*<\/a>/g;
		inputObj.homeNameRegex = /homeHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">(\w)*<\/a>/g;
		inputObj.awayScoreRegex = /awayHeaderScore">(\d)*<\/span>/g;
		inputObj.homeScoreRegex = /homeHeaderScore">(\d)*<\/span>/g;
		inputObj.statusLineRegex = /statusLine1" style="text-indent: 5px;">(-|\w|\s|:|\d|;|&)*<\/li>/g;
		inputObj.awayScoreRegexBegin = 'awayHeaderScore">';
		inputObj.homeScoreRegexBegin = 'homeHeaderScore">';
		inputObj.awayTeamRegexBegin = /awayHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">/g;
		inputObj.homeTeamRegexBegin = /homeHeader"><td class="team-name" nowrap="nowrap"><div class="(\s|\w|-)*"><a href="(\w|:|\/|\.|-)*">/g;
		inputObj.scoreEndTag = '</span>';
		inputObj.teamEndTag = '</a>';
	}
	else {
		inputObj.awayNameRegex = /aTeamName"><a title="(&|\w|\s|-|\(|\)|\.|')*"/g;
		inputObj.homeNameRegex = /hTeamName"><a title="(&|\w|\s|-|\(|\)|\.|')*"/g;
		inputObj.awayScoreRegex = /awayHeaderScore">[0-9]*<\/li>/g;
		inputObj.homeScoreRegex = /homeHeaderScore">[0-9]*<\/li>/g;
		inputObj.statusLineRegex = /statusLine1">(-|\w|\s|:|\d|;|&)*<\/p>/g;
		inputObj.awayScoreRegexBegin = 'awayHeaderScore">';
		inputObj.homeScoreRegexBegin = 'homeHeaderScore">';
		inputObj.awayTeamRegexBegin = 'aTeamName"><a title="';
		inputObj.homeTeamRegexBegin = 'hTeamName"><a title="';
		inputObj.scoreEndTag = '</li>';
		inputObj.teamEndTag = '"';
	}
	processPage(eventType, inputObj, doc, callback);
}

function makeRequest(options, eventType, callback) {
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
			parseSport(eventType, body, callback);
		    }
		}); 
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	req.write('data');
	req.end();
}

function processEvents(events, i, callback) {
	if (i < events.length) {
		var today = new Date();
		today = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
		var options, path;

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
		makeRequest(options, events[i], function() {
			processEvents(events, ++i, callback);
		});
	}
	else {
		callback();
	}

}

exports.runScript = function(scriptRunner, callback) {
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
		processEvents(events, 0, function () {
			callback();
		});
	});
};
