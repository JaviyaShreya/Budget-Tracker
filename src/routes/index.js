const express = require('express');
const router = express.Router();

const useroutes = require('./useroutes');
const budgetroute = require('./budgetroute');
const expenseroute = require('./expenseroute');

router.use('/', useroutes);
router.use('/', budgetroute);
router.use('/', expenseroute);

module.exports = router;