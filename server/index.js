const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { verifyConnection } = require('./db');
const { getDeals, getReferralChains, getGraphData, createContactWithReferral } = require('./queries');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API 1: Health & Database Status
app.get('/api/health', async (req, res) => {
  try {
    const status = await verifyConnection();
    res.json({
      status: 'ok',
      database: status
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// API 2: Get Deals & Pipeline
app.get('/api/deals', async (req, res) => {
  try {
    const result = await getDeals();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Get Multi-Hop Referral Chains (2+ Hops Query)
app.get('/api/referrals', async (req, res) => {
  try {
    const maxHops = req.query.maxHops ? parseInt(req.query.maxHops) : 3;
    const result = await getReferralChains(maxHops);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 4: Get Full Graph Visualization Data
app.get('/api/graph', async (req, res) => {
  try {
    const result = await getGraphData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 5: Create Contact & Referral Link
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, title, companyName, referrerName } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required fields.' });
    }
    const result = await createContactWithReferral({ name, email, title, companyName, referrerName });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 6: Seed Database Trigger
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database successfully seeded with realistic dataset!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Graph CRM Backend running on http://localhost:${PORT}`);
});
