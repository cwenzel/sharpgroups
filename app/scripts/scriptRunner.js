'use strict';
var biScraper = require('./scrapeBoardItems');
var resultScraper = require('./scrapeResults');
var wagerScript = require('./updateWagers');

var arg = process.argv[2];

switch (arg) {
	case 'board':
		biScraper.runScript(true);
		break;
	case 'score':
		resultScraper.runScript(true);
		break;
	case 'wager':
		wagerScript.runScript(true);
		break;
	default:
		console.log('Usage: node runScript.js $arg');
		console.log("Where $arg is in ['board', 'score', 'wager']");
		break;
}

