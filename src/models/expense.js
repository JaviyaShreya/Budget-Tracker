const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new mongoose.Schema({
    iUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nAmount: {
        type: Number,
        required: true,
        min: [0, 'Amount must be a positive number'],
    },
    sDate: {
        type: Date,
        default: Date.now,
    },
    aInventoryItems: [
        {
            iInventoryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Inventory',
                required: true,
            },
            nQuantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be a positive number'],
            },
            sCategory: {
                type: String,
                required: true,
            },
            sName: {
                type: String,
                required: true,
            },
            nAmount: {
                type: Number,
                required: true,
                min: [0, 'Amount must be a positive number'],
            },
        },
    ],
});

module.exports = mongoose.model('Expense', expenseSchema);
