const { executeQuery, verifyConnection } = require('./db');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Starting CognoDB Database Seeding Process...');

  const conn = await verifyConnection();
  if (!conn.connected) {
    console.error('❌ Cannot seed database:', conn.message);
    console.log('💡 Make sure COGNODB_URI and COGNODB_PASSWORD in .env are set to a valid CognoDB instance.');
    process.exit(1);
  }

  console.log('✅ Connected to CognoDB Cloud. Clearing old seed data...');

  try {
    // 1. Clear existing dataset safely
    await executeQuery(`MATCH (n) DETACH DELETE n`);
    console.log('🧹 Existing graph database nodes and relationships cleared.');

    // 2. Create Unique Constraints (or Indexes) for performance
    console.log('📌 Creating graph schema constraints...');
    await executeQuery(`CREATE CONSTRAINT contact_email IF NOT EXISTS FOR (c:Contact) REQUIRE c.email IS UNIQUE`);
    await executeQuery(`CREATE CONSTRAINT company_name IF NOT EXISTS FOR (c:Company) REQUIRE c.name IS UNIQUE`);
    await executeQuery(`CREATE CONSTRAINT deal_id IF NOT EXISTS FOR (d:Deal) REQUIRE d.id IS UNIQUE`);

    // 3. Seed Companies
    console.log('🏢 Seeding Companies...');
    const companies = [
      { name: 'Apex Global', industry: 'Enterprise Software', region: 'North America' },
      { name: 'Innovate AI', industry: 'Artificial Intelligence', region: 'Europe' },
      { name: 'ScaleUp Labs', industry: 'FinTech', region: 'Asia Pacific' },
      { name: 'Quantum Cybersecurity', industry: 'Cybersecurity', region: 'North America' },
      { name: 'CloudFlow Networks', industry: 'Cloud Infrastructure', region: 'Europe' }
    ];

    for (const company of companies) {
      await executeQuery(
        `MERGE (c:Company {name: $name}) SET c.industry = $industry, c.region = $region`,
        company
      );
    }

    // 4. Seed Contacts
    console.log('👤 Seeding Contacts...');
    const contacts = [
      { id: 'c1', name: 'Sarah Jenkins', email: 'sarah.j@apexglobal.com', title: 'VP of Engineering', company: 'Apex Global' },
      { id: 'c2', name: 'David Chen', email: 'david.c@innovate.ai', title: 'CTO & Co-Founder', company: 'Innovate AI' },
      { id: 'c3', name: 'Elena Rostova', email: 'elena.r@scaleuplabs.io', title: 'Chief Revenue Officer', company: 'ScaleUp Labs' },
      { id: 'c4', name: 'Marcus Vance', email: 'marcus.v@quantumsec.com', title: 'Director of IT Security', company: 'Quantum Cybersecurity' },
      { id: 'c5', name: 'Priya Sharma', email: 'priya.s@cloudflow.net', title: 'Managing Director', company: 'CloudFlow Networks' },
      { id: 'c6', name: 'Alex Rivera', email: 'alex.r@apexglobal.com', title: 'Head of Infrastructure', company: 'Apex Global' }
    ];

    for (const contact of contacts) {
      await executeQuery(
        `
        MERGE (c:Contact {email: $email})
        SET c.id = $id, c.name = $name, c.title = $title
        WITH c
        MATCH (comp:Company {name: $company})
        MERGE (c)-[:WORKS_AT]->(comp)
        `,
        contact
      );
    }

    // 5. Seed Multi-Hop Referral Chains (1-hop, 2-hop, 3-hop)
    console.log('🔗 Creating Multi-Hop Referral Network Connections...');
    const referralPairs = [
      // 1-Hop referrals
      { from: 'sarah.j@apexglobal.com', to: 'david.c@innovate.ai', note: 'Direct Introduction at AI Summit' },
      { from: 'david.c@innovate.ai', to: 'marcus.v@quantumsec.com', note: 'Former Senior Architect at Google' },
      { from: 'elena.r@scaleuplabs.io', to: 'sarah.j@apexglobal.com', note: 'Advisory Board Member Network' },
      { from: 'priya.s@cloudflow.net', to: 'elena.r@scaleuplabs.io', note: 'Venture Capital Portfolio Connection' },
      { from: 'alex.r@apexglobal.com', to: 'priya.s@cloudflow.net', note: 'Shared Previous Employer' }
    ];

    for (const ref of referralPairs) {
      await executeQuery(
        `
        MATCH (from:Contact {email: $from})
        MATCH (to:Contact {email: $to})
        MERGE (from)-[r:REFERRED {note: $note, date: date()}]->(to)
        `,
        ref
      );
    }

    // 6. Seed Deals & Assignments
    console.log('💼 Seeding Deals & Stakeholder Relationships...');
    const deals = [
      {
        id: 'deal-101',
        title: 'Enterprise AI Platform License',
        value: 120000,
        stage: 'Closed Won',
        company: 'Innovate AI',
        managerEmail: 'david.c@innovate.ai',
        influencerEmail: 'sarah.j@apexglobal.com'
      },
      {
        id: 'deal-102',
        title: 'Zero-Trust Security Infrastructure',
        value: 85000,
        stage: 'Qualified',
        company: 'Quantum Cybersecurity',
        managerEmail: 'marcus.v@quantumsec.com',
        influencerEmail: 'david.c@innovate.ai'
      },
      {
        id: 'deal-103',
        title: 'Cloud Managed Services Renewal',
        value: 150000,
        stage: 'Closed Won',
        company: 'CloudFlow Networks',
        managerEmail: 'priya.s@cloudflow.net',
        influencerEmail: 'elena.r@scaleuplabs.io'
      },
      {
        id: 'deal-104',
        title: 'FinTech Compliance Audit Suite',
        value: 65000,
        stage: 'Lead',
        company: 'ScaleUp Labs',
        managerEmail: 'elena.r@scaleuplabs.io',
        influencerEmail: 'sarah.j@apexglobal.com'
      }
    ];

    for (const deal of deals) {
      await executeQuery(
        `
        MERGE (d:Deal {id: $id})
        SET d.title = $title, d.value = $value, d.stage = $stage
        WITH d
        MATCH (comp:Company {name: $company})
        MERGE (d)-[:FOR_COMPANY]->(comp)
        WITH d
        MATCH (mgr:Contact {email: $managerEmail})
        MERGE (mgr)-[:MANAGES]->(d)
        WITH d
        MATCH (inf:Contact {email: $influencerEmail})
        MERGE (inf)-[:INFLUENCES]->(d)
        `,
        deal
      );
    }

    console.log('🎉 Seeding successfully completed!');
    console.log('📊 Seed Summary:');
    const countRes = await executeQuery(`
      MATCH (c:Contact) WITH count(c) AS contacts
      MATCH (comp:Company) WITH contacts, count(comp) AS companies
      MATCH (d:Deal) WITH contacts, companies, count(d) AS deals
      MATCH ()-[r:REFERRED]->() WITH contacts, companies, deals, count(r) AS referrals
      RETURN contacts, companies, deals, referrals
    `);
    
    if (countRes.records.length > 0) {
      const rec = countRes.records[0];
      console.log(`   - Contacts: ${rec.get('contacts')}`);
      console.log(`   - Companies: ${rec.get('companies')}`);
      console.log(`   - Deals: ${rec.get('deals')}`);
      console.log(`   - Referral Relationships: ${rec.get('referrals')}`);
    }
  } catch (err) {
    console.error('❌ Error seeding CognoDB database:', err);
    process.exit(1);
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = { seedDatabase };
