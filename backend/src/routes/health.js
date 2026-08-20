const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: states[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;