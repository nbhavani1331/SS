





const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectToDatabase } = require('./src/config/database');
const { setRoutes } = require('./src/routes/app');

const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 4000;

// Middleware
app.use(require('express-status-monitor')()); // Optional: Monitor server stats
app.use(cors());                              // Enable CORS
app.use(express.json());                      // Parse JSON requests
setRoutes(app);



// Default route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to DB and start the server
connectToDatabase()
  .then(() => {
    console.log('✅ Connected to the database.');
    
    // Set API routes
    setRoutes(app);

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });
