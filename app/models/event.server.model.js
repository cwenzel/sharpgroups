'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Event Schema
 */
var EventSchema = new Schema({
	title: {
		type: String
	},
	alternateTitle : {
		type: String
	},
    	inSeason : {
		type: Boolean	   
	},
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Event', EventSchema);
