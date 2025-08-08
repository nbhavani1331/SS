
const mysql = require('mysql2/promise');
const { connectToDatabase } = require('../config/database');

// ================== MARKET STOCK OPERATIONS ==================

// Fetch all available market stocks
const getAllStocks = async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query('SELECT * FROM market_stocks');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks', details: err.message });
  }
};

// Get item from market_stocks by stock_id
const getMarketStockById = async (req, res) => {
  const { stock_id } = req.params;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM market_stocks WHERE stock_id = ?', [stock_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};


const getMarketStockBySymbol = async (req, res) => {
  const { stock_symbol } = req.params;

  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query(
      'SELECT * FROM market_stocks WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};


// Create a new item in market_stocks
const createMarketStock = async (req, res) => {
  const {
    stock_id,
    stock_symbol,
    company_name,
    available_quantity,
    price_per_unit,
    sector
  } = req.body;

  try {
    const connection = await connectToDatabase();

    const query = `
      INSERT INTO market_stocks 
      (stock_id, stock_symbol, company_name, available_quantity, price_per_unit, sector) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await connection.query(query, [stock_id, stock_symbol, company_name, available_quantity, price_per_unit, sector]);
    res.status(201).json({ message: 'Stock added successfully', insertedId: stock_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert', details: err.message });
  }
};

// ================== TRANSACTION LOG ==================

// Get all transaction history
const getTransactions = async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query('SELECT * FROM transaction_log ORDER BY transaction_date DESC');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
};

//get User owned Stocks
const getUserStocks = async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query('SELECT * FROM user_portfolio ORDER BY stock_symbol');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user portfolio', details: err.message });
  }
};


// Get transaction by ID
const getTransactionById = async (req, res) => {
  const { transaction_id } = req.params;

  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM transaction_log WHERE transaction_id = ?', [transaction_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// ================== BUY / SELL ==================

// Buy stock
// const buyStock = async (req, res) => {
//   const { stock_symbol, quantity } = req.body;
//   const qty = parseInt(quantity);

//   if (!stock_symbol || !qty || qty <= 0) {
//     return res.status(400).json({ error: 'Invalid input' });
//   }

//   try {
//     const connection = await connectToDatabase();

//     // 1. Check if stock exists in market_stocks
//     const [stockRows] = await connection.query(
//       'SELECT * FROM market_stocks WHERE stock_symbol = ?',
//       [stock_symbol]
//     );

//     if (stockRows.length === 0) {
//       return res.status(404).json({ error: 'Stock not found in market' });
//     }

//     const stock = stockRows[0];

//     // 2. Check if enough quantity is available
//     if (qty > stock.available_quantity) {
//       return res.status(400).json({ error: 'Requested quantity not available' });
//     }

//     const newMarketQty = stock.available_quantity - qty;

//     // 3. Update market_stocks
//     await connection.query(
//       'UPDATE market_stocks SET available_quantity = ? WHERE stock_symbol = ?',
//       [newMarketQty, stock_symbol]
//     );

//     // 4. Check if stock already exists in user_portfolio
//     const [userRows] = await connection.query(
//       'SELECT * FROM user_portfolio WHERE stock_symbol = ?',
//       [stock_symbol]
//     );

//     if (userRows.length === 0) {
//       // Insert new row if stock doesn't exist
//       await connection.query(
//         'INSERT INTO user_portfolio (stock_symbol, quantity) VALUES (?, ?)',
//         [stock_symbol, qty]
//       );
//     } else {
//       // Update quantity if stock already exists
//       const existingQty = userRows[0].quantity;
//       const updatedQty = existingQty + qty;

//       await connection.query(
//         'UPDATE user_portfolio SET quantity = ? WHERE stock_symbol = ?',
//         [updatedQty, stock_symbol]
//       );
//     }

//     // 5. Insert into transaction_log
//     await connection.query(
//       'INSERT INTO transaction_log (stock_symbol, transaction_type, quantity, price_per_unit) VALUES (?, "BUY", ?, ?)',
//       [stock_symbol, qty, stock.price_per_unit]
//     );

//     res.status(200).json({ message: 'Stock bought successfully' });

//   } catch (err) {
//     res.status(500).json({ error: 'Buy transaction failed', details: err.message });
//   }
// };
const buyStock = async (req, res) => {
  const { stock_symbol, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!stock_symbol || isNaN(qty)) {
    return res.status(400).json({ error: 'Invalid input: Missing or malformed data' });
  }

  if (qty <= 0) {
    return res.status(400).json({ error: 'Invalid quantity. Must be greater than 0.' });
  }

  try {
    const connection = await connectToDatabase();

    // 1. Check if stock exists in market_stocks
    const [stockRows] = await connection.query(
      'SELECT * FROM market_stocks WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (stockRows.length === 0) {
      return res.status(404).json({ error: 'Stock not found in market' });
    }

    const stock = stockRows[0];

    // 2. Check if enough quantity is available
    if (qty > stock.available_quantity) {
      return res.status(400).json({ error: 'Quantity unavailable. Only ' + stock.available_quantity + ' left in market.' });
    }

    const newMarketQty = stock.available_quantity - qty;

    // 3. Update market_stocks
    await connection.query(
      'UPDATE market_stocks SET available_quantity = ? WHERE stock_symbol = ?',
      [newMarketQty, stock_symbol]
    );

    // 4. Check if stock already exists in user_portfolio
    const [userRows] = await connection.query(
      'SELECT * FROM user_portfolio WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (userRows.length === 0) {
      // Insert new row if stock doesn't exist
      await connection.query(
        'INSERT INTO user_portfolio (stock_symbol, quantity) VALUES (?, ?)',
        [stock_symbol, qty]
      );
    } else {
      // Update quantity if stock already exists
      const existingQty = userRows[0].quantity;
      const updatedQty = existingQty + qty;

      await connection.query(
        'UPDATE user_portfolio SET quantity = ? WHERE stock_symbol = ?',
        [updatedQty, stock_symbol]
      );
    }

    // 5. Insert into transaction_log
    await connection.query(
      'INSERT INTO transaction_log (stock_symbol, transaction_type, quantity, price_per_unit) VALUES (?, "BUY", ?, ?)',
      [stock_symbol, qty, stock.price_per_unit]
    );

    res.status(200).json({ message: `Stock bought successfully. (${qty} units of ${stock_symbol})` });

  } catch (err) {
    res.status(500).json({ error: 'Buy transaction failed', details: err.message });
  }
};





// Sell stock
/*const sellStock = async (req, res) => {
  const { stock_symbol, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!stock_symbol || !qty || qty <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const connection = await connectToDatabase();

    // 1. Check user portfolio for stock and sufficient quantity
    const [userRows] = await connection.query(
      'SELECT * FROM user_portfolio WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (userRows.length === 0 || userRows[0].quantity < qty) {
      return res.status(400).json({ error: 'Not enough stock to sell' });
    }

    const userQty = userRows[0].quantity;
    const newUserQty = userQty - qty;

    // 2. Update or delete user_portfolio
    if (newUserQty === 0) {
      await connection.query(
        'DELETE FROM user_portfolio WHERE stock_symbol = ?',
        [stock_symbol]
      );
    } else {
      await connection.query(
        'UPDATE user_portfolio SET quantity = ? WHERE stock_symbol = ?',
        [newUserQty, stock_symbol]
      );
    }

    // 3. Update market_stocks (increase quantity)
    const [marketRows] = await connection.query(
      'SELECT * FROM market_stocks WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (marketRows.length === 0) {
      return res.status(404).json({ error: 'Market stock not found' });
    }

    const marketQty = marketRows[0].available_quantity;
    const updatedMarketQty = marketQty + qty;

    await connection.query(
      'UPDATE market_stocks SET available_quantity = ? WHERE stock_symbol = ?',
      [updatedMarketQty, stock_symbol]
    );

    // 4. Log transaction
    await connection.query(
      'INSERT INTO transaction_log (stock_symbol, transaction_type, quantity, price_per_unit) VALUES (?, "SELL", ?, ?)',
      [stock_symbol, qty, marketRows[0].price_per_unit]
    );

    res.status(200).json({ message: 'Stock sold successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Sell transaction failed', details: err.message });
  }
};
*/

const sellStock = async (req, res) => {
  const { stock_symbol, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!stock_symbol || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const connection = await connectToDatabase();

    // 1. Check user portfolio
    const [userRows] = await connection.query(
      'SELECT * FROM user_portfolio WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ error: 'Stock not found in user portfolio' });
    }

    const userQty = userRows[0].quantity;

    if (qty > userQty) {
      return res.status(400).json({ error: `Not enough stock to sell. You only have ${userQty}` });
    }

    const newUserQty = userQty - qty;

    // 2. Update or delete user_portfolio
    if (newUserQty === 0) {
      await connection.query(
        'DELETE FROM user_portfolio WHERE stock_symbol = ?',
        [stock_symbol]
      );
    } else {
      await connection.query(
        'UPDATE user_portfolio SET quantity = ? WHERE stock_symbol = ?',
        [newUserQty, stock_symbol]
      );
    }

    // 3. Update market_stocks (increase available_quantity)
    const [marketRows] = await connection.query(
      'SELECT * FROM market_stocks WHERE stock_symbol = ?',
      [stock_symbol]
    );

    if (marketRows.length === 0) {
      return res.status(404).json({ error: 'Market stock not found' });
    }

    const updatedMarketQty = marketRows[0].available_quantity + qty;

    await connection.query(
      'UPDATE market_stocks SET available_quantity = ? WHERE stock_symbol = ?',
      [updatedMarketQty, stock_symbol]
    );

    // 4. Log transaction
    await connection.query(
      'INSERT INTO transaction_log (stock_symbol, transaction_type, quantity, price_per_unit) VALUES (?, "SELL", ?, ?)',
      [stock_symbol, qty, marketRows[0].price_per_unit]
    );

    res.status(200).json({ message: 'Stock sold successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Sell transaction failed', details: err.message });
  }
};



// ================== EXPORT ==================

module.exports = {
  getAllStocks,
  getMarketStockById,
  createMarketStock,
  getTransactions,
  getTransactionById,
  buyStock,
  sellStock,
  getUserStocks,
  getMarketStockBySymbol
};
