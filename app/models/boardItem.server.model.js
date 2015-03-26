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
	eventType: {
		type: Schema.ObjectId,
                ref: 'Event'
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
	processed: {
		type: Boolean
	},
	winner: {
		type: Boolean
	},
	teams: [{
		type: String
	}],
	type: {
		type: String
	},
	expired: {
		type: Boolean
	},
	push : {
		type: Boolean
	}
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('BoardItem', BoardItemSchema);
