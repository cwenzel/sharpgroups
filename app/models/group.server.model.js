'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var userIsInGroup = false;
var userBankroll = 0;

function startDateValidator(startDate) {
	if (this.userInGroup === true)
		return true;

	if (this.endDate < startDate)
		return false;

	var startDateObject = new Date(startDate.toString());
	console.log(this.startDate);
	console.log(startDate);
	
	var currentDate = new Date();

	if (startDateObject < currentDate)
		return false;

	return true;
}

var customStartDateValidator = [startDateValidator, 'The start date can not be in the past and must be before the end date'];


function maxBetValidator(maxBet) {
	if (maxBet > this.bankroll)
		return false;

	return true;
}


var customMaxBetValidator = [maxBetValidator, 'The maximum bet must be less than your starting bankroll'];

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
	maxBet: {
		type: Number,
		validate: customMaxBetValidator
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
	events: [{
		type: Schema.ObjectId,
		ref: 'Event'
	}],
	messages: [{
		'text' : {
			type: String
		},
		'entered' : {
			type: Date
		},
		'userName' : {
			type: String
		}
	}],
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

GroupSchema.virtual('userInGroup').get(function () {
	return userIsInGroup;
}).set(function (val) {
	userIsInGroup = val;
});

GroupSchema.virtual('userBankroll').get(function() {
	return userBankroll;
}).set(function (val) {
	userBankroll = val;
});

mongoose.model('Group', GroupSchema);
