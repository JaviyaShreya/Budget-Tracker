const mongoose = require('mongoose');
const { Schema } = mongoose;
const {aCategory} = require('../utils/enums');

const inventrySchema = new mongoose.Schema({
    sName: {
        type: String,
        required: true,
        trim: true,
    },
    eCategory: {
        type: String,
        enums:aCategory,        
        required: true,
        trim: true,
    },
    sPrice: {
        type: Number,
        required: true,
    },
    nQuantity: {
        type: Number,
        required: true,
    },
}, 
{ 
    timestamps:{
    createdAt: 'dCreatedAt', 
    updatedAt: 'dUpdatedAt'
}
 });

 module.exports = mongoose.model('Inventory', inventrySchema);