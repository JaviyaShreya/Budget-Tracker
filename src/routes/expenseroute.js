const express = require('express');
const router = express.Router();
const { addExpense, getAllExpenses, deleteExpense } = require('../controllers/expensecontroller');
const { verifyToken } = require('../middleware/jwt');

router.post('/expenses', verifyToken, addExpense);
router.get('/expenses', verifyToken, getAllExpenses);
router.delete('/expenses/:id', verifyToken, deleteExpense);

module.exports = router;
