'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Group Schema
 */
var GroupSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
        bankroll: {
                type: Number
        },
        startDate: {
                type: Date
        },
        endDate: {
                type: Date
        },
	commissioner: {
		type: Schema.ObjectId,
		ref: 'User'
	},
        players: [{
                type: Schema.ObjectId,
                ref: 'User'
        }],
});

mongoose.model('Group', GroupSchema);
