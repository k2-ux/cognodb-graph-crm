const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI || 'bolt+s://demo.databases.cognodb.cloud';
const user = process.env.COGNODB_USER || 'cognodb';
const password = process.env.COGNODB_PASSWORD || '';

let driver = null;
let isConnected = false;

function getDriver() {
  if (!driver && uri && password && password !== 'demo-password') {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionLifetime: 3 * 60 * 1000,
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 5000,
      });
    } catch (err) {
      console.error('Failed to create CognoDB driver:', err.message);
    }
  }
  return driver;
}

async function verifyConnection() {
  const d = getDriver();
  if (!d) {
    return {
      connected: false,
      message: 'CognoDB credentials not configured in .env file (COGNODB_URI & COGNODB_PASSWORD required).'
    };
  }

  const session = d.session();
  try {
    const result = await session.run('RETURN 1 AS test');
    isConnected = true;
    return {
      connected: true,
      message: 'Successfully connected to CognoDB Cloud Graph Database!'
    };
  } catch (err) {
    isConnected = false;
    return {
      connected: false,
      message: `Connection error: ${err.message}`
    };
  } finally {
    await session.close();
  }
}

async function executeQuery(cypher, params = {}) {
  const d = getDriver();
  if (!d) {
    throw new Error('CognoDB driver not initialized. Please set valid credentials in .env');
  }

  const session = d.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

module.exports = {
  getDriver,
  verifyConnection,
  executeQuery,
  getIsConnected: () => isConnected
};
