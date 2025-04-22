const mongoose = require('mongoose');
const {mongo_url} = require('./config');

module.exports = {
    connectDB: async () => {
        try {
            await mongoose.connect(mongo_url);
            // console.log(mongo_url),
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
    },
};