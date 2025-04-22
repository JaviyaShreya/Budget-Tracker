const jwt = require('jsonwebtoken');
const { secret } = require('../config/config');
const {status} = require('../utils/statuscode.js')

// const createToken = async (req, res) => {
//   try {
//     const token = await jwt.sign( secret, { expiresIn: '7d' });
//     req.token = token;
//   } catch (err) {
//     console.log(err);
//   }
// };

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(status.UNAUTHORIZED).json({ error: 'Token not provided' });
    }
    const decoded = await jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(status.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  verifyToken
};
