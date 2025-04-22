const express = require('express');
const {reqvalidator, validateLogin,validateRegister} = require('../middleware/validators.js')
const {registerUser, loginUser} = require('../controllers/usercontroller.js')
 
const router = express.Router();
 
router.post('/register', reqvalidator, validateRegister,registerUser);
router.post('/login',reqvalidator, validateLogin, loginUser);

module.exports = router;