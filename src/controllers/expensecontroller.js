const Expense = require('../models/expense');
const Budget = require('../models/budget');
const Inventory = require('../models/inventory');
const {status} = require('../utils/statuscode');


const addExpense = async (req, res) => {
  try {
    const { iUserId, aInventoryItems, dDate } = req.body;
 
    if (!Array.isArray(aInventoryItems) || aInventoryItems.length === 0) {
      return res.status(status.BAD_REQUEST).json({ message: 'aInventoryItems is required and must be a non-empty array' });
    }
 
    const oBudget = await Budget.findOne({ iUserId });
    if (!oBudget) {
      return res.status(status.BAD_REQUEST).json({ message: 'No budget set for this user' });
    }
 
    const date = dDate ? new Date(dDate) : new Date();
 
    const dStartOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const dStartOfWeek = new Date(date);
    dStartOfWeek.setDate(dStartOfWeek.getDate() - dStartOfWeek.getDay());
    dStartOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(dStartOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const dStartOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
 
    const [dailyExpenses, weeklyExpenses, monthlyExpenses] = await Promise.all([
      Expense.find({ iUserId, dDate: { $gte: dStartOfDay, $lte: endOfDay } }),
      Expense.find({ iUserId, dDate: { $gte: dStartOfWeek, $lte: endOfWeek } }),
      Expense.find({ iUserId, dDate: { $gte: dStartOfMonth, $lte: endOfMonth } })
    ]);
 
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
        return res.status(status.BAD_REQUEST).json({ message: `Insufficient quantity for item: ${oInventory.sName}` });
      }
 
      const nItemTotal = oInventory.sPrice * item.nQuantity;
      nTotalAmount += nItemTotal;
 
      aDetailedItems.push({
        iInventoryId: oInventory._id,
        sName: oInventory.sName,
        sCategory: oInventory.eCategory,
        nQuantity: item.nQuantity,
        nAmount: nItemTotal
      });
    }
 
    const exceedsBudget = (limit, totalSoFar, newExpense) => totalSoFar + newExpense > limit;
 
    let exceeded = null;
    let exceededAmount = 0;
 
    if (exceedsBudget(oBudget.nDailyLimit, totalDaily, nTotalAmount)) {
      exceeded = 'daily';
      exceededAmount = (totalDaily + nTotalAmount) - oBudget.nDailyLimit;
    } else if (exceedsBudget(oBudget.nWeeklyLimit, totalWeekly, nTotalAmount)) {
      exceeded = 'weekly';
      exceededAmount = (totalWeekly + nTotalAmount) - oBudget.nWeeklyLimit;
    } else if (exceedsBudget(oBudget.nMonthlyLimit, totalMonthly, nTotalAmount)) {
      exceeded = 'monthly';
      exceededAmount = (totalMonthly + nTotalAmount) - oBudget.nMonthlyLimit;
    }
 
    if (exceeded) {
      let amountToAdjust = exceededAmount;
      const sortedItems = [...aDetailedItems].sort((a, b) => b.nAmount - a.nAmount);
      const itemsToRemove = [];
 
      for (const item of sortedItems) {
        itemsToRemove.push(item);
        amountToAdjust -= item.nAmount;
        if (amountToAdjust <= 0) break;
      }
 
      return res.status(status.BAD_REQUEST).json({
        message: `Your ${exceeded} budget is exceeded by ₹${exceededAmount.toFixed(2)}.`,
        suggestion: {
          message: 'Remove the following item(s) to fit within your budget:',
          items: itemsToRemove
        }
      });
    }
 
    for (const item of aDetailedItems) {
      await Inventory.findByIdAndUpdate(item.iInventoryId, {
        $inc: { nQuantity: -item.nQuantity }
      });
    }
 
    await Expense.create({
      iUserId,
      dDate: new Date(),
      aInventoryItems: aDetailedItems,
      nAmount: nTotalAmount
    });
 
    return res.status(status.CREATED).json({ message: 'Expense added successfully', totalAmount: nTotalAmount });
 
  } catch (err) {
    console.error(err);
    return res.status(status.SERVER_ERROR).json({ message: 'Internal server error' });
  }
};
 
const getAllExpenses = async (req, res) => {
  try {
    const iUserId = req.params.userId;
 
    const aExpenses = await Expense.find({ iUserId })

    if (aExpenses.length === 0) {
      return res.status(status.OK).json({
        message: 'This user has not made any expenses yet',
        aExpenses: [],
        nTotalExpense: 0,
      });
    }
 
    const nTotalExpense = aExpenses.reduce((total, expense) => {
      return total + (expense.nAmount || 0);
    }, 0);
 
    res.status(status.OK).json({
      aExpenses,
      nTotalExpense,
      message: 'Expenses fetched successfully',
    });
  } catch (error) {
    console.log(error)
    res.status(status.SERVER_ERROR).json({message: 'Error fetching expenses',error: error.message,});
  }
};
  const deleteExpense = async (req, res) => {
    try {
      const iUserId = req.params.userId;
  
      const oDeleted = await Expense.findByIdAndDelete(iUserId);
  
      if (!oDeleted) {
        return res.status(status.NOT_FOUND).json({ message: 'Expense not found' });
      }
  
      res.status(status.OK).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      res.status(status.SERVER_ERROR).json({ message: 'Error deleting expense', error: error.message });
    }
  };
    

module.exports = { addExpense , getAllExpenses, deleteExpense };
