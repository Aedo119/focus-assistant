const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);

async function startBackend() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start backend:', err);
    process.exit(1);
  }
}

module.exports = { startBackend };