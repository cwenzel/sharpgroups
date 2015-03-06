'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TeamSchema = new Schema({
	sports: [{
		type: String
	}],
	name : {
		type: String
	},
	alternateName : {
		type: String
	}
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Team', TeamSchema);

