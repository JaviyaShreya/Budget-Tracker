const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new mongoose.Schema({
    iUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    iBudgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget',
        required: true,
    },
    nAmount: {
        type: Number,
        required: true,
        min: [0, 'Amount must be a positive number'],
    },
    sDate:{
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Expense', expenseSchema);
 