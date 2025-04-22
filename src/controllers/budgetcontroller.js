const Budget = require('../models/budget');
const Expense = require('../models/expense');
const {status} = require('../utils/statuscode');

const addBudget = async (req, res) => {
    try {
        const {iUserId, nDailyLimit, nWeeklyLimit, nMonthlyLimit } = req.body;
        const now = new Date();
        const oBudget = await Budget.findOne({
            iUserId: iUserId,
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
              $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
          });
      
          if (oBudget) {
           return res.status(status.BAD_REQUEST).json({ message: 'Budget already exists for this month' });
          }

        //   if(nDailyLimit <= 0 || nWeeklyLimit <= 0 || nMonthlyLimit <= 0 || nDailyLimit<= nWeeklyLimit || nDailyLimit <= nMonthlyLimit || nWeeklyLimit <= nMonthlyLimit){
        //     return res.status(status.BAD_REQUEST).json({ message: 'Budget limits must be greater than 0 ' });    
        //   }
        
          const newBudget = new Budget({
            iUserId: iUserId,
            nDailyLimit,
            nWeeklyLimit,
            nMonthlyLimit,
          });
      
          await newBudget.save();
        return res.status(status.CREATED).json({ message: 'Budget added successfully', newBudget });
    }
     catch (error) {
      console.error('Error adding budget:', error);
      return res.status(status.SERVER_ERROR).json({ message: 'Server error while adding budget', error: error.message });
    }
  };
  
  const getBudget = async (req, res) => {
    try {
      const iUserId = req.user.iUserId;
  
      const oBudget = await Budget.findOne({ iUserId });
  
      if (!oBudget) {
        return res.status(status.NOT_FOUND).json({ message: 'No budget found for this user' });
      }
  
      return res.status(status.OK).json({ oBudget });
  
    } catch (error) {
      console.error('Error fetching budget:', error);
      return res.status(status.SERVER_ERROR).json({ message: 'Server error while fetching budget', error: error.message });
    }
  };
  
  module.exports = { addBudget, getBudget };