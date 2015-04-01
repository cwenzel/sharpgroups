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
    boardItem: {
		type: Schema.ObjectId,
		ref: 'BoardItem'
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	group: {
		type: Schema.ObjectId,
		ref: 'Group'
	},
	amount: {
		type: Number,
		min: 0.01
	},
    created: {
        type: Date
    },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Wager', WagerSchema);
