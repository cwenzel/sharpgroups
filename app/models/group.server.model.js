'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


function startDateValidator(startDate) {
	if (this.endDate < startDate)
		return false;

	var startDateObject = new Date(startDate.toString());
	console.log(startDate);
	console.log(startDateObject.toUTCString());
	
	var currentDate = new Date();
	console.log(currentDate.toUTCString());

	if (startDateObject < currentDate)
		return false;

	return true;
}

var customStartDateValidator = [startDateValidator, 'The start date can not be in the past and must be before the end date'];

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
                type: Date,
		validate: customStartDateValidator
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
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

var userIsInGroup = false;
GroupSchema.virtual('userInGroup').get(function () {
	return userIsInGroup;
}).set(function (val) {
	userIsInGroup = val;
});

var userBankroll = 0;
GroupSchema.virtual('userBankroll').get(function() {
	return userBankroll;
}).set(function (val) {
	userBankroll = val;
});

mongoose.model('Group', GroupSchema);
