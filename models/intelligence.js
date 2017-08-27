/**
 *Module dependencies
 */
var
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');
//==============================================================================
/**
 *Module Variables
 */
//==============================================================================
/**
 *Create Intelligence Schema
 */
var IntelligenceSchema = mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String
    },
    departmentId: {
        type: Number,
        required: true
    },
    asked_by: {
        type: String,
        required: true
    },
    answered_by: {
        type: String
    },
    asked_on: {
        type: Date,
        default: Date.now,
        required: true
    },
    answered_on: {
        type: Date,
        default: Date.now
    },
    readByUser: {
        type: Boolean,
        default: false
    }
});
//==============================================================================
/**
 *Create Intelligence Model
 */
var IntelligenceModel = mongoose.model('Intelligence', IntelligenceSchema);
//==============================================================================
/**
 *Export Module
 */
module.exports = IntelligenceModel;
//==============================================================================