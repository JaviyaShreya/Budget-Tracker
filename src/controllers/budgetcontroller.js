const Budget = require('../models/budget');
const Expense = require('../models/expense');
const {status} = require('../utils/statuscode');

const addBudget = async (req, res) => {
  try {
    const { iUserId, nDailyLimit, nWeeklyLimit, nMonthlyLimit } = req.body;

    const now = new Date();
    const dCurrentMonth = now.getMonth();
    const dCurrentYear = now.getFullYear();
    const dStartOfMonth = new Date(dCurrentYear, dCurrentMonth, 1);
    const dStartOfNextMonth = new Date(dCurrentYear, dCurrentMonth + 1, 1);

    if (nDailyLimit <= 0 || nWeeklyLimit <= 0 || nMonthlyLimit <= 0) {
      return res.status(status.BAD_REQUEST).json({
        message: 'Budget limits must be greater than 0',
      });
    }

    if (nDailyLimit > nWeeklyLimit || nDailyLimit > nMonthlyLimit) {
      return res.status(status.BAD_REQUEST).json({
        message: 'Daily limit cannot be greater than weekly and monthly limit',
      });
    }

    if (nWeeklyLimit > nMonthlyLimit) {
      return res.status(status.BAD_REQUEST).json({
        message: 'Weekly limit cannot be greater than monthly limit',
      });
    }

    const oExistingBudget = await Budget.findOne({
      iUserId,
      dCreatedAt: { $gte: dStartOfMonth, $lt: dStartOfNextMonth },
    });

    if (oExistingBudget) {
      return res.status(status.BAD_REQUEST).json({
        message: 'Budget already exists for this month',
      });
    }

    await Budget.deleteOne({ iUserId });

    const oNewBudget = await Budget.create({
      iUserId,
      nDailyLimit,
      nWeeklyLimit,
      nMonthlyLimit,
      dCreatedAt: now,
    });

    return res.status(status.CREATED).json({
      message: 'Monthly budget created successfully',
      budget: oNewBudget,
    });

  } catch (error) {
    console.error('Error adding budget:', error);
    return res.status(status.SERVER_ERROR).json({
      message: 'Server error while adding budget',
      error: error.message,
    });
  }
};



const getBudget = async (req, res) => {
  try {
    const iUserId = req.params.userId;

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