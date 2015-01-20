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
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Wager', WagerSchema);
