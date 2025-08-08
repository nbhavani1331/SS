
const { Router } = require('express');
const {
    getAllStocks,
    getMarketStockById,
    createMarketStock,
    getTransactions,
    getTransactionById,
    buyStock,
    sellStock,
    getUserStocks,
    getMarketStockBySymbol
  } = require('../controllers/index');

  function setRoutes(app) {
    // Market Stocks Routes
    app.get('/api/stocks', getAllStocks);                       // Get all stocks
    app.get('/api/stocks/:stock_id', getMarketStockById);       // Get stock by ID
    app.get('/api/stocks/market/:stock_symbol', getMarketStockBySymbol);       // Get stock by symbol
    app.post('/api/stocks', createMarketStock);                 // Create a new stock
  
    // Transaction Log Routes
    app.get('/api/transactions/all', getTransactions);                 // Get all transactions
    app.get('/api/transactions/:transaction_id', getTransactionById); // Get transaction by ID
  
    // Buy & Sell Routes
    app.put('/api/stocks/buy', buyStock);                        // Buy stock
    app.put('/api/stocks/sell', sellStock);                      // Sell stock

    app.get('/api/getUserStocks', getUserStocks);    //gets user owned stocks
  }
  
  module.exports = {setRoutes};


 
  
