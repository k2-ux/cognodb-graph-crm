const { executeQuery, verifyConnection } = require('./db');

// Mock fallback dataset when CognoDB is not yet connected
const mockData = {
  contacts: [
    { id: 'c1', name: 'Sarah Jenkins', email: 'sarah@apex.com', title: 'VP of Product', company: 'Apex Global' },
    { id: 'c2', name: 'David Chen', email: 'david@innovate.io', title: 'CTO', company: 'Innovate AI' },
    { id: 'c3', name: 'Elena Rostova', email: 'elena@scaleup.co', title: 'Head of Growth', company: 'ScaleUp Labs' },
    { id: 'c4', name: 'Marcus Vance', email: 'marcus@quantum.tech', title: 'Director of IT', company: 'Quantum Tech' },
    { id: 'c5', name: 'Priya Sharma', email: 'priya@cloudflow.net', title: 'Managing Director', company: 'CloudFlow' }
  ],
  companies: [
    { id: 'comp1', name: 'Apex Global', industry: 'Enterprise Tech', region: 'North America' },
    { id: 'comp2', name: 'Innovate AI', industry: 'Artificial Intelligence', region: 'Europe' },
    { id: 'comp3', name: 'ScaleUp Labs', industry: 'SaaS', region: 'Asia Pacific' },
    { id: 'comp4', name: 'Quantum Tech', industry: 'Cybersecurity', region: 'North America' }
  ],
  deals: [
    { id: 'd1', title: 'Enterprise AI Platform License', value: 85000, stage: 'Closed Won', company: 'Innovate AI', manager: 'David Chen', referrer: 'Sarah Jenkins' },
    { id: 'd2', title: 'Cloud Infrastructure Upgrade', value: 120000, stage: 'Qualified', company: 'Apex Global', manager: 'Sarah Jenkins', referrer: 'Elena Rostova' },
    { id: 'd3', title: 'Security Audit & Compliance', value: 45000, stage: 'Lead', company: 'Quantum Tech', manager: 'Marcus Vance', referrer: 'David Chen' },
    { id: 'd4', title: 'Analytics Integration Suite', value: 62000, stage: 'Closed Won', company: 'ScaleUp Labs', manager: 'Elena Rostova', referrer: 'Sarah Jenkins' }
  ],
  referrals: [
    { source: 'Sarah Jenkins', target: 'David Chen', hops: 1, note: 'Direct Introduction at Tech Summit' },
    { source: 'David Chen', target: 'Marcus Vance', hops: 1, note: 'Former colleague at Oracle' },
    { source: 'Sarah Jenkins', target: 'Marcus Vance', hops: 2, via: 'David Chen', note: '2-Hop Referral Path' },
    { source: 'Elena Rostova', target: 'Sarah Jenkins', hops: 1, note: 'Advisory Board Network' },
    { source: 'Elena Rostova', target: 'David Chen', hops: 2, via: 'Sarah Jenkins', note: '2-Hop Referral Path' }
  ]
};

// 1. Fetch Deals with Associated Contacts & Companies
async function getDeals() {
  const status = await verifyConnection();
  if (!status.connected) {
    return { data: mockData.deals, isMock: true, statusMessage: status.message };
  }

  const cypher = `
    MATCH (d:Deal)
    OPTIONAL MATCH (c:Contact)-[:MANAGES]->(d)
    OPTIONAL MATCH (d)-[:FOR_COMPANY]->(comp:Company)
    OPTIONAL MATCH (ref:Contact)-[:REFERRED]->(c)
    RETURN 
      d.id AS id, 
      d.title AS title, 
      d.value AS value, 
      d.stage AS stage,
      c.name AS manager,
      comp.name AS company,
      ref.name AS referrer
    ORDER BY d.value DESC
  `;

  try {
    const result = await executeQuery(cypher);
    const deals = result.records.map(record => ({
      id: record.get('id'),
      title: record.get('title'),
      value: record.get('value') ? Number(record.get('value')) : 0,
      stage: record.get('stage'),
      manager: record.get('manager') || 'Unassigned',
      company: record.get('company') || 'N/A',
      referrer: record.get('referrer') || 'Direct Search'
    }));
    return { data: deals, isMock: false };
  } catch (err) {
    console.error('Error in getDeals query:', err.message);
    return { data: mockData.deals, isMock: true, statusMessage: err.message };
  }
}

// 2. Fetch Multi-Hop Referral Chains (2+ Hops Cypher Query)
async function getReferralChains(maxHops = 3) {
  const status = await verifyConnection();
  if (!status.connected) {
    return { data: mockData.referrals, isMock: true, statusMessage: status.message };
  }

  // Parameterized Cypher query with multi-hop variable-length relationship traversal
  const cypher = `
    MATCH path = (source:Contact)-[:REFERRED*1..3]->(target:Contact)
    OPTIONAL MATCH (target)-[:MANAGES|INFLUENCES]->(d:Deal)
    RETURN 
      source.name AS source,
      target.name AS target,
      length(path) AS hops,
      [node IN nodes(path) | node.name] AS fullPath,
      d.title AS dealTitle,
      d.value AS dealValue
    ORDER BY hops ASC, dealValue DESC
  `;

  try {
    const result = await executeQuery(cypher);
    const referrals = result.records.map(record => {
      const pathArr = record.get('fullPath');
      const hops = record.get('hops') ? Number(record.get('hops')) : 1;
      return {
        source: record.get('source'),
        target: record.get('target'),
        hops: hops,
        path: pathArr,
        via: pathArr.length > 2 ? pathArr.slice(1, -1).join(' ➔ ') : null,
        dealTitle: record.get('dealTitle') || null,
        dealValue: record.get('dealValue') ? Number(record.get('dealValue')) : null
      };
    });
    return { data: referrals, isMock: false };
  } catch (err) {
    console.error('Error in getReferralChains query:', err.message);
    return { data: mockData.referrals, isMock: true, statusMessage: err.message };
  }
}

// 3. Fetch Graph Visualization Data (Nodes & Edges)
async function getGraphData() {
  const status = await verifyConnection();
  if (!status.connected) {
    // Generate vis-network format for mock data
    const nodes = [
      ...mockData.contacts.map(c => ({ id: c.name, label: c.name, group: 'Contact', title: `${c.title} @ ${c.company}` })),
      ...mockData.companies.map(c => ({ id: c.name, label: c.name, group: 'Company', title: `Industry: ${c.industry}` })),
      ...mockData.deals.map(d => ({ id: d.title, label: `${d.title}\n(\$${d.value.toLocaleString()})`, group: 'Deal', title: `Stage: ${d.stage}` }))
    ];
    const edges = [
      { from: 'Sarah Jenkins', to: 'Apex Global', label: 'WORKS_AT' },
      { from: 'David Chen', to: 'Innovate AI', label: 'WORKS_AT' },
      { from: 'Elena Rostova', to: 'ScaleUp Labs', label: 'WORKS_AT' },
      { from: 'Marcus Vance', to: 'Quantum Tech', label: 'WORKS_AT' },
      { from: 'Sarah Jenkins', to: 'David Chen', label: 'REFERRED (1 Hop)' },
      { from: 'David Chen', to: 'Marcus Vance', label: 'REFERRED (1 Hop)' },
      { from: 'Elena Rostova', to: 'Sarah Jenkins', label: 'REFERRED (1 Hop)' },
      { from: 'Sarah Jenkins', to: 'Cloud Infrastructure Upgrade', label: 'MANAGES' },
      { from: 'David Chen', to: 'Enterprise AI Platform License', label: 'MANAGES' },
      { from: 'Marcus Vance', to: 'Security Audit & Compliance', label: 'MANAGES' }
    ];
    return { data: { nodes, edges }, isMock: true, statusMessage: status.message };
  }

  const cypher = `
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, m LIMIT 100
  `;

  try {
    const result = await executeQuery(cypher);
    const nodesMap = new Map();
    const edgesArr = [];

    result.records.forEach(record => {
      const n = record.get('n');
      const r = record.get('r');
      const m = record.get('m');

      if (n) {
        const labels = n.labels || [];
        const props = n.properties || {};
        const id = props.id || props.name || props.title || String(n.identity);
        const label = props.name || props.title || id;
        const type = labels[0] || 'Node';
        if (!nodesMap.has(id)) {
          nodesMap.set(id, { id, label, group: type, properties: props });
        }
      }

      if (m) {
        const labels = m.labels || [];
        const props = m.properties || {};
        const id = props.id || props.name || props.title || String(m.identity);
        const label = props.name || props.title || id;
        const type = labels[0] || 'Node';
        if (!nodesMap.has(id)) {
          nodesMap.set(id, { id, label, group: type, properties: props });
        }
      }

      if (r && n && m) {
        const fromProps = n.properties || {};
        const toProps = m.properties || {};
        const from = fromProps.id || fromProps.name || fromProps.title || String(n.identity);
        const to = toProps.id || toProps.name || toProps.title || String(m.identity);
        edgesArr.push({
          from,
          to,
          label: r.type,
          properties: r.properties
        });
      }
    });

    return {
      data: {
        nodes: Array.from(nodesMap.values()),
        edges: edgesArr
      },
      isMock: false
    };
  } catch (err) {
    console.error('Error in getGraphData query:', err.message);
    return { data: { nodes: [], edges: [] }, isMock: true, statusMessage: err.message };
  }
}

// 4. Add Contact & Referral via Parameterized Cypher
async function createContactWithReferral({ name, email, title, companyName, referrerName }) {
  const status = await verifyConnection();
  if (!status.connected) {
    throw new Error('Cannot write to CognoDB: Database connection is offline or credentials are missing.');
  }

  const cypher = `
    MERGE (c:Contact {email: $email})
    ON CREATE SET c.id = randomUUID(), c.name = $name, c.title = $title, c.createdAt = datetime()
    ON MATCH SET c.name = $name, c.title = $title

    MERGE (comp:Company {name: $companyName})
    ON CREATE SET comp.id = randomUUID(), comp.industry = 'General'

    MERGE (c)-[:WORKS_AT]->(comp)

    WITH c
    CALL {
      WITH c
      WITH c WHERE $referrerName IS NOT NULL AND $referrerName <> ''
      MATCH (ref:Contact {name: $referrerName})
      MERGE (ref)-[:REFERRED {date: date()}]->(c)
      RETURN ref
    }

    RETURN c.id AS id, c.name AS name
  `;

  const params = {
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    title: String(title || 'Professional').trim(),
    companyName: String(companyName || 'Independent').trim(),
    referrerName: referrerName ? String(referrerName).trim() : null
  };

  const result = await executeQuery(cypher, params);
  const record = result.records[0];
  return { id: record.get('id'), name: record.get('name') };
}

module.exports = {
  getDeals,
  getReferralChains,
  getGraphData,
  createContactWithReferral,
  mockData
};
