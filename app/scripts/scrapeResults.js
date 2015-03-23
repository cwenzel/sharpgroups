'use strict';

var querystring = require('querystring');
var http = require('http');
var Score = require('../models/score.server.model.js');

var mongoose = require('mongoose'),
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

/**
 * Module dependencies.
 */

exports.runScript = function() {

	var today = new Date();
	today = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
	
	var currentEvents = ['nba', 'ncb', 'nhl'];
	
	for (var i in currentEvents) {
		var options;
		if (currentEvents[i] != 'ncb') {
			var path = '/' + currentEvents[i] + '/caster/realtime';
			options = {
			  host: 'insider.espn.go.com',
			  port: 80,
			  path: path,
			  method: 'GET',
			  headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36'
			  }
			};
		}
		else {
			var path = '/' + currentEvents[i] + '/scoreboard';
		 	options = {
			  host: 'scores.espn.go.com',
			  port: 80,
			  path: path,
			  method: 'GET',
			  headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36'
			  }
			};	
		}
		makeRequest(options, currentEvents[i]);
	}
	
	function makeRequest(options, sport) {
		var req = http.request(options, function(res) {
		  res.setEncoding('utf8');
		  var body = '';
		  res.on('data', function (chunk) {
		      body += chunk;
		  });
		  res.on('end', function() {
			//write body to a tmp file for debugging
			var fs = require('fs');
			fs.writeFile(sport+".tmp", body, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file was saved!");
			    }
			}); 
			parseSport(sport, body);
		  });
		});
		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});
		
		// write data to request body
		req.write('data');
		req.end();
	}
	
	function parseSport(sport, doc) {
		var statusLines, awayNames, homeNames, awayScores, homeScores;
	
		if (sport != 'ncb') {
			awayNames = doc.match(/class="regNameAway">.*<\/div>/g);
			homeNames = doc.match(/class="regNameHome">.*<\/div>/g);
			awayScores = doc.match(/class="regScoreAway" align="right">.*<\/div>/g);
			homeScores = doc.match(/class="regScoreHome" align="right">.*<\/div>/g);
			statusLines = doc.match(/class="clockStatus">.*class="gameLink" target="_blank">.*<\/(a|A)>/g);
			for (var i in awayScores) {
				var awayScore = parseInt(awayScores[i].replace('class="regScoreAway" align="right">', '').replace('</div>', ''));
				var homeScore = parseInt(homeScores[i].replace('class="regScoreHome" align="right">', '').replace('</div>', ''));
				var awayTeam = awayNames[i].replace('class="regNameAway">', '').replace('</div>', '');
				var homeTeam = homeNames[i].replace('class="regNameHome">', '').replace('</div>', '');
	
				if (statusLines[i].indexOf('Final') > -1) {
					processGame(sport, awayTeam, homeTeam, awayScore, homeScore);
				}
			}
		}
		else {
			awayNames = doc.match(/aTeamName"><a title="(&|\w|\s|-|\(|\)|\.|')*"/g);
			homeNames = doc.match(/hTeamName"><a title="(&|\w|\s|-|\(|\)|\.|')*"/g);
			awayScores = doc.match(/awayHeaderScore">[0-9]*<\/li>/g);
			homeScores = doc.match(/homeHeaderScore">[0-9]*<\/li>/g);
			statusLines = doc.match(/statusLine1">(-|\w|\s|:|\d|;|&)*<\/p>/g);
			for (var i in awayScores) {
				if (awayScores[i] && homeScores[i] && homeNames[i] && awayNames[i]) {
					var awayScore = parseInt(awayScores[i].replace('awayHeaderScore">', '').replace('</li>', ''));
					var homeScore = parseInt(homeScores[i].replace('homeHeaderScore">', '').replace('</li>', ''));
					var awayTeam = awayNames[i].replace('aTeamName"><a title="', '').replace('"', '');
					var homeTeam = homeNames[i].replace('hTeamName"><a title="', '').replace('"', '');
	
					if (statusLines[i].indexOf('Final') > -1) {
						processGame(sport, awayTeam, homeTeam, awayScore, homeScore);
					}
				}
			}
		}
	}
	
	function processGame(sport, awayTeam, homeTeam, awayScore, homeScore) {
		var obj = {'homeTeamName' : homeTeam, 'awayTeamName' : awayTeam, 'homeTeamScore' : homeScore, 'awayTeamScore' : awayScore, 'sport' : sport};
		console.log(obj);
		Score.find(obj).exec(function (err, s) {
			if (err)
				console.log('err ' + err);
			if (s && s.length > 0) {
				console.log('already entered:');
				console.log(obj);
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
}

