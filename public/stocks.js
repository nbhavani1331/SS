const API = 'http://localhost:3000/stocks';

async function loadStocks() {
  const res = await fetch(API);
  const stocks = await res.json();

  const tbody = document.querySelector('#stocks-table tbody');
  tbody.innerHTML = '';

  stocks.forEach(stock => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${stock.user_id}</td>
      <td>${stock.username}</td>
      <td>${stock.stock_symbol}</td>
      <td>${stock.stock_company_name}</td>
      <td>${stock.transaction_type}</td>
      <td>${stock.quantity}</td>
      <td>${stock.price}</td>
      <td>${stock.transaction_date.split('T')[0]}</td>
      <td>${stock.sector || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

loadStocks();


