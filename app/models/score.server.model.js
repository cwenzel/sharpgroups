'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Score Schema
 */
var ScoreSchema = new Schema({
	awayTeamName: {
		type: String
	},
	homeTeamName: {
		type: String
	},
	awayTeamScore: {
		type: Number
	},
	homeTeamScore: {
		type: Number
	}
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Score', ScoreSchema);
