const API = 'http://localhost:3000/stocks';

document.getElementById('stock-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const stock = {
    user_id: document.getElementById('user_id').value,
    username: document.getElementById('username').value,
    stock_symbol: document.getElementById('stock_symbol').value,
    stock_company_name: document.getElementById('stock_company_name').value,
    transaction_type: document.getElementById('transaction_type').value,
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value),
    transaction_date: document.getElementById('transaction_date').value,
    sector: document.getElementById('sector').value
  };

  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stock)
  });

  alert("Stock added successfully!");
  document.getElementById('stock-form').reset();
});
