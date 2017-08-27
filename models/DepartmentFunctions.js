/**
 *Module dependencies
 */
var DepartmentModel = require('./department');
//==============================================================================
/**
 *User Model Utility functions
 */
function errHandler(err) {
    console.error('There was an error performing the operation');
    console.log(err);
    console.log(err.code);
    return console.error(err.message);
}

function validationErr(err, res) {
    Object.keys(err.errors).forEach(function(k) {
        var msg = err.errors[k].message;
        console.error('Validation error for \'%s' + ': %s', k, msg);
        return res.status(404).json({
            msg: 'Please ensure required fields are filled'
        });
    });
}


//==============================================================================
/**
 * Export module
 */
module.exports = {
    errHandler: errHandler,
    validationErr: validationErr,
    storeQuestion: storeQuestion,
};
//==============================================================================