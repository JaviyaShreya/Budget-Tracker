const mongoose = require('mongoose');
const { Schema } = mongoose;
const {hashPassword, hashPasswordMiddleware} = require('../utils/passwaord');

const userschema = new mongoose.Schema({
    sName: {
        type: String,
        required: true,
        trim: true,
    },
    sEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    sPassword: {
        type: String,
        required: true,
    },
});
userschema.pre('save', hashPasswordMiddleware )
module.exports = mongoose.model('User', userschema);
