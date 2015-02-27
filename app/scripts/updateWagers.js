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

BoardItem.find({'processed' : false}).exec(function (err, boardItem) {

console.log(boardItem);
});

