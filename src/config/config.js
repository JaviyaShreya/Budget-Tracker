const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 9000,
    secret:process.env.JWT_SECRET ||  'secret',
    mongo_url: process.env.MONGODB_URL || 'mongodb://localhost:27017'
}