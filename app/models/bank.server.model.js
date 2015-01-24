'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Bank Schema
 */
var BankSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	group: {
		type: Schema.ObjectId,
		ref: 'Group'
	},
	amount: {
		type: Number
	},
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Bank', BankSchema);
