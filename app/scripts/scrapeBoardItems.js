'use strict';

var querystring = require('querystring');
var http = require('http');
var inserter = require('./insertBoardItems');
/**
 * Module dependencies.
 */

exports.runScript = function() {

	var today = new Date();
	console.log('Scraping board items for:');
	console.log(today);
	today = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
	
	var post_data = querystring.stringify({
	      '__EVENTTARGET' : 'ctl00$content$ctl00$w_10412$_4e400085$ctl00$lbDownload',
	      '__EVENTARGUMENT' : '',
	      '__VIEWSTATE' : '/wEPDwUKMTgwNjUyODkwM2Rk',
	      'ctl00$content$ctl00$w_10412$_4e400085$ctl00$txtGameDt' : today,
	      'ctl00$content$ctl00$w_10412$_4e400085$ctl00$hdnAllowDownload' : '1',
	      'ctl00$content$ctl00$w_10412$_4e400085$ctl00$hfSport' : 'all',
	      'ctl00$content$ctl00$w_10412$_4e400085$ctl00$hfCal' : '0',
	      'ctl00$content$ctl00$w_10414$_4e400085$ctl00$txtComment' : '',
	      'ctl00$content$ctl00$w_10414$_4e400085$ctl00$hfParentId' : '0',
	      'ctl00$content$ctl00$w_10414$_4e400085$ctl00$hfReplyId' : '0',
	      'ctl00$content$ctl00$w_10414$_4e400085$ctl00$hfReportAbuse' : '0',
	      'ctl00$content$ctl00$w_10414$_4e400085$ctl00$hfIsLoggedIn' : '0'
	
	});
	
	var options = {
	  host: 'pregame.com',
	  port: 80,
	  path: '/sportsbook_spy/default.aspx',
	  method: 'POST',
	  headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36', 
		'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': post_data.length}
	};
	
	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  var body = '';
	  res.on('data', function (chunk) {
	      body += chunk;
	  });
	  res.on('end', function() {
	      inserter.insertBoardItems(body);
	  });
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	req.write(post_data);
	req.end();
}

this.runScript();
