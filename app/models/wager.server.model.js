'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Wager Schema
 */
var WagerSchema = new Schema({
        eventDate: {
                type: Date
        },
	sport: {
		type: String
	},
	description: {
		type: String
	},
	juice: {
		type: String
	},
	takers: [{
                type: Schema.ObjectId,
                ref: 'User'
	}],
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

var userPlacedWager = false;
WagerSchema.virtual('userPlacedWager').get(function () {
	return userPlacedWager;
}).set(function (val) {
	userPlacedWager = val;
});

mongoose.model('Wager', WagerSchema);
