const express = require('express');
const router = express.Router();
const { addBudget, getBudget } = require('../controllers/budgetcontroller.js');
const { verifyToken } = require('../middleware/jwt.js');

 
router.post('/budget', verifyToken, addBudget);
router.get('/budget', verifyToken, getBudget);
 
module.exports = router;