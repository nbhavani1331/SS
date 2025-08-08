// // tests/controllers.test.js
// const request = require('supertest');
// const express = require('express');
// const { setRoutes } = require('../src/routes/app'); // ✅ import routes
// const { connectToDatabase } = require('../src/config/database');

// const app = express();
// app.use(express.json());
// setRoutes(app); // mount all routes

// beforeAll(async () => {
//   await connectToDatabase(); // real DB or mock, depending on setup
// });

// describe('Market Stock Endpoints', () => {
//   it('should add a new stock', async () => {
//     const response = await request(app)
//       .post('/api/stocks')
//       .send({
//         stock_id: 10,
//         stock_symbol: 'NFLX',
//         company_name: 'Netflix Inc.',
//         available_quantity: 500,
//         price_per_unit: '495.32',
//         sector: 'Entertainment'
//       });

//     expect(response.statusCode).toBe(201);
//     expect(response.body.message).toMatch(/added successfully/i);
//   });

//   it('should fetch a stock by ID', async () => {
//     const response = await request(app).get('/api/stocks/9');
//     expect(response.statusCode).toBe(200);
//     expect(response.body.stock_symbol).toBe('WIPR');
//   });
// });

// describe('Buy & Sell Endpoints', () => {
//   it('should buy stock', async () => {
//     const response = await request(app)
//       .post('/api/stocks/buy')
//       .send({
//         stock_symbol: 'NFLX',
//         quantity: 100
//       });

//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toMatch(/bought successfully/i);
//   });

//   it('should sell stock', async () => {
//     const response = await request(app)
//       .post('/api/stocks/sell')
//       .send({
//         stock_symbol: 'NFLX',
//         quantity: 50
//       });

//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toMatch(/sold successfully/i);
//   });
// });


// tests/controllers.test.js
const request = require('supertest');
const express = require('express');
const { setRoutes } = require('../src/routes/app');
const { connectToDatabase } = require('../src/config/database');

const app = express();
app.use(express.json());
setRoutes(app);

beforeAll(async () => {
  await connectToDatabase();
});

describe('Market Stock Endpoints', () => {
  it('should add a new stock', async () => {
    const response = await request(app)
      .post('/api/stocks')
      .send({
        stock_id: 10,
        stock_symbol: 'NFLX',
        company_name: 'Netflix Inc.',
        available_quantity: 500,
        price_per_unit: '495.32',
        sector: 'Entertainment'
      });

    if (response.statusCode === 201) {
      console.log('✅ Test Passed: Added new stock');
    } else {
      console.log('❌ Test Failed: Could not add new stock', response.body);
    }

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toMatch(/added successfully/i);
  });

  it('should fetch a stock by ID', async () => {
    const response = await request(app).get('/api/stocks/9');

    if (response.statusCode === 200 && response.body.stock_symbol === 'WIPR') {
      console.log('✅ Test Passed: Fetched stock with ID 9');
    } else {
      console.log('❌ Test Failed: Could not fetch stock or mismatch', response.body);
    }

    expect(response.statusCode).toBe(200);
    expect(response.body.stock_symbol).toBe('WIPR'); // Adjust this as per actual DB value
  });
});

describe('Buy & Sell Endpoints', () => {
  it('should buy stock', async () => {
    const response = await request(app)
      .post('/api/stocks/buy')
      .send({
        stock_symbol: 'AAPL',
        quantity: 3
      });

    if (response.statusCode === 200) {
      console.log('✅ Test Passed: Bought stock');
    } else {
      console.log('❌ Test Failed: Could not buy stock', response.body);
    }

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatch(/bought successfully/i);
  });

  it('should sell stock', async () => {
    const response = await request(app)
      .post('/api/stocks/sell')
      .send({
        stock_symbol: 'INFY',
        quantity: 50
      });

    if (response.statusCode === 200) {
      console.log('✅ Test Passed: Sold stock');
    } else {
      console.log('❌ Test Failed: Could not sell stock', response.body);
    }

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatch(/sold successfully/i);
  });
});
