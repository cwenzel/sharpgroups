'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * BoardItem Schema
 */
var BoardItemSchema = new Schema({
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
	seq: {
		type: Number
	},
	grouping: {
		type: Number
	},
	expired: {
		type: Boolean
	},
	winner: {
		type: Boolean
	}
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('BoardItem', BoardItemSchema);
