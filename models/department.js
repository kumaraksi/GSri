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
 *Create Department Schema
 */
var DepartmentSchema = mongoose.Schema({
    departmentName: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true
    }
});

//==============================================================================
/**
 *Create Department Model
 */
var DepartmentModel = mongoose.model('Department', DepartmentSchema);
//==============================================================================
/**
 *Export Module
 */
module.exports = DepartmentModel;
//==============================================================================