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
    	seasonStart : {
		type: Date   
	},
    	seasonEnd : {
		type: Date
	},
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Event', EventSchema);
