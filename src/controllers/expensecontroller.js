const Expense = require('../models/expense');
const Budget = require('../models/budget');
const Inventory = require('../models/inventory');
const {status} = require('../utils/statuscode');

const addExpense = async (req, res) => {
  try {
    const { iUserId, aInventoryItems, sDate } = req.body;

    if (!Array.isArray(aInventoryItems) || aInventoryItems.length === 0) {
      return res.status(status.BAD_REQUEST).json({ message: 'aInventoryItems is required and must be a non-empty array' });
    }

    const oBudget = await Budget.findOne({ iUserId });
    if (!oBudget) {
      return res.status(status.BAD_REQUEST).json({ message: 'No budget set for this user' });
    }

    const date = sDate ? new Date(sDate) : new Date();
    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(date); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); endOfMonth.setHours(23, 59, 59, 999);

    const dailyExpenses = await Expense.find({ iUserId, sDate: { $gte: startOfDay, $lte: endOfDay } });
    const weeklyExpenses = await Expense.find({ iUserId, sDate: { $gte: startOfWeek, $lte: endOfWeek } });
    const monthlyExpenses = await Expense.find({ iUserId, sDate: { $gte: startOfMonth, $lte: endOfMonth } });

    const totalDaily = dailyExpenses.reduce((sum, e) => sum + e.nAmount, 0);
    const totalWeekly = weeklyExpenses.reduce((sum, e) => sum + e.nAmount, 0);
    const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.nAmount, 0);

    let nTotalAmount = 0;
    const aDetailedItems = [];


    for (const item of aInventoryItems) {
      if (!item.iInventoryId || typeof item.nQuantity !== 'number' || item.nQuantity <= 0) {
        return res.status(status.BAD_REQUEST).json({ message: 'Each inventory item must have valid iInventoryId and nQuantity > 0' });
      }

  
      const oInventory = await Inventory.findById(item.iInventoryId);
      if (!oInventory) {
        return res.status(status.BAD_REQUEST).json({ message: `Inventory item not found: ${item.iInventoryId}` });
      }

      if (item.nQuantity > oInventory.nQuantity) {
        return res.status(status.BAD_REQUEST).json({
          message: `Insufficient quantity for item: ${oInventory.sName}`,
        });
      }
      oInventory.nQuantity -= item.nQuantity;
      await oInventory.save();


      const nItemTotal = oInventory.sPrice * item.nQuantity;
      nTotalAmount += nItemTotal;

      aDetailedItems.push({
        iInventoryId: oInventory._id,
        nQuantity: item.nQuantity,
        sCategory: oInventory.eCategory,
        sName: oInventory.sName,
        nAmount: nItemTotal
      });
    }

    // const remainingDailyBudget = oBudget.nDailyLimit -  nTotalAmount;

    // if (remainingDailyBudget < nTotalAmount) {
    //   return res.status(status.BAD_REQUEST).json({ 
    //     message: 'Daily budget exceeded. You can only spend ' + remainingDailyBudget + ' more today.' 
    //   });
    // }
    if (totalDaily + nTotalAmount >= oBudget.nDailyLimit) {
      return res.status(status.BAD_REQUEST).json({ message: 'Daily budget already used. No more expenses allowed today.' });
    }

    if (
      totalDaily + nTotalAmount > oBudget.nDailyLimit ||
      totalWeekly + nTotalAmount > oBudget.nWeeklyLimit ||
      totalMonthly + nTotalAmount > oBudget.nMonthlyLimit
    ) {
      const oSuggestion = [...aDetailedItems].sort((a, b) => b.nAmount - a.nAmount)[0];
      return res.status(status.BAD_REQUEST).json({
        message: 'Budget exceeded. Remove one item to fit within the budget.',
        suggestion: {
          iInventoryId: oSuggestion.iInventoryId,
          sName: oSuggestion.sName,
          sCategory: oSuggestion.sCategory,
          nAmount: oSuggestion.nAmount
        }
      });
    }

    const oNewExpense = new Expense({
      iUserId,
      iBudgetId: oBudget._id,
      nAmount: nTotalAmount,
      sDate: date,
      aInventoryItems: aDetailedItems
    });

    await oNewExpense.save();

    oBudget.nDailyLimit -= nTotalAmount;
    oBudget.nWeeklyLimit -= nTotalAmount;
    oBudget.nMonthlyLimit -= nTotalAmount;
    await oBudget.save();

    res.status(status.CREATED).json({ message: 'Expense added successfully', oNewExpense });

  } catch (error) {
    console.log(error)
    res.status(status.SERVER_ERROR).json({ message: 'Error adding expense', error: error.message });
  }
};

const getAllExpenses = async (req, res) => {
    try {
      const iUserId = req.user.iUserId;
  
      const aExpenses = await Expense.find({ iUserId }).populate('aInventoryItems.iInventoryId');
  
      res.status(status.OK).json({ aExpenses });
    } catch (error) {
      res.status(status.SERVER_ERROR).json({ message: 'Error fetching expenses', error: error.message });
    }
  };
  const deleteExpense = async (req, res) => {
    try {
      const { id } = req.params;
  
      const oDeleted = await Expense.findByIdAndDelete(id);
  
      if (!oDeleted) {
        return res.status(status.NOT_FOUND).json({ message: 'Expense not found' });
      }
  
      res.status(status.OK).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      res.status(status.SERVER_ERROR).json({ message: 'Error deleting expense', error: error.message });
    }
  };
    

module.exports = { addExpense , getAllExpenses, deleteExpense };
