const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const locationRoutes = require('./routes/location');
app.use('/location', locationRoutes);

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
