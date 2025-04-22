const bcrypt = require('bcrypt');
 
const hashPassword = async (password) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

const hashPasswordMiddleware = async function (next) {
  try {
    if (!this.isModified('sPassword')) return next(); 
    this.sPassword = await hashPassword(this.sPassword);
    next();
  } catch (err) {
    console.log(err);
  }
};


 
 
module.exports = { hashPassword, hashPasswordMiddleware };