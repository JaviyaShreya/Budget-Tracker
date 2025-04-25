const mongoose = require('mongoose');
const { Schema } = mongoose;
 
const budgetSchema = new mongoose.Schema({
    iUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nMonthlyLimit: {
        type: Number,
        required: true,
        min: [0, 'Monthly limit must be a positive number'],
    },
    nDailyLimit: {
        type: Number,
        default: 0,
    },
    nWeeklyLimit: {
        type: Number,
        default: 0,
    }
},{
    timestamps:{
        createdAt: 'dCreatedAt', 
        updatedAt: 'dUpdatedAt'
    }
});
 
module.exports = mongoose.model('Budget', budgetSchema);