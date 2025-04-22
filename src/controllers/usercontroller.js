const User = require('../models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { hashPassword} = require('../utils/passwaord');
const {status }= require('../utils/statuscode');

const registerUser = async (req, res) => {
  try {
    const { sName, sEmail, sPassword } = req.body;

    const existingUser = await User.findOne({ sEmail });
    if (existingUser) {
      return res.status(status.BAD_REQUEST).json({ message: 'Email already registered' });
    }
    const hashedPassword = await hashPassword(sPassword);
    const sUser = new User({ sName, sEmail, sPassword: hashedPassword });
    await sUser.save();
 

    const iNewId = new mongoose.Types.ObjectId();

    const token = jwt.sign({ iUserId: iNewId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    
    res.status(status.CREATED).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.log(error)
    res.status(status.SERVER_ERROR).json({ message: 'Error registering user', error: error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { sEmail, sPassword } = req.body;

    const sUser = await User.findOne({ sEmail });
    if (!sUser) {
      return res.status(status.BAD_REQUEST).json({ message: 'Invalid credentials' });
    }
    console.log(sUser.sPassword)
    console.log(sPassword)
   
    const isMatch = bcrypt.compare(sPassword, sUser.sPassword);
    if (!isMatch) {
      return res.status(status.BAD_REQUEST).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ iUserId: sUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(status.OK).json({ message: 'Login successful', token });
  } catch (error) {
    console.log(error)
    res.status(status.SERVER_ERROR).json({ message: 'Error logging in', error: error});
  }
};

module.exports = { registerUser, loginUser };
