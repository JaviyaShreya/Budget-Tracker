const {check, validationResult, body} = require('express-validator');
const {status} = require('../utils/statuscode')

function reqvalidator(req,res,next){
    const err = validationResult(req);
    if(!err.isEmpty()){
        return res.status(status.BAD_REQUEST).json({error:err});
    }
    next();
}
const validateRegister = [
    body('sName')
        .notEmpty()
        .isString()
        .withMessage('Name is required'),
    body('sEmail')
        .isEmail()
        .withMessage('A valid email is required'),
    body('sPassword')   
        .notEmpty()
        .withMessage('Password is required')
];
 
const validateLogin = [
  body('sEmail')
    .isEmail()
    .withMessage('A valid email is required'),
  body('sPassword')
    .notEmpty()
    .withMessage('Password is required')
];
 

module.exports = { reqvalidator, validateLogin ,validateRegister};