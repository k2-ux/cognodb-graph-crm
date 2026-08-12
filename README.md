# GraphCRM — Simple Lead & Referral Graph Application

A lightweight, modern **Lead & Referral CRM** web application powered by **CognoDB Cloud** (openCypher over Bolt protocol) and React.

---

## 🎯 Use Case & Problem Statement

In B2B sales and relationship management, discovering **referral chains** (*"Who introduced whom across 2 or 3 degrees of separation to reach a decision maker?"*) is critical. 

### Why a Graph Database?
In a traditional relational SQL database, finding multi-degree connection chains requires expensive, awkward nested `JOIN` queries across multiple junction tables (`contacts`, `referrals`, `companies`, `deals`). Scaling SQL queries for multi-hop paths (e.g., 3+ hops) often degrades performance significantly.

In **CognoDB (Graph Database)**:
- Nodes (`Contact`, `Company`, `Deal`) and relationships (`:REFERRED`, `:WORKS_AT`, `:MANAGES`, `:INFLUENCES`) are **first-class entities**.
- Finding 1-hop, 2-hop, and 3-hop referral networks is performed in a single line of Cypher: `MATCH path = (source:Contact)-[:REFERRED*1..3]->(target:Contact) RETURN path`.
- Instant pathfinding allows sales teams to leverage warm introductions effortlessly.

---

## 📐 Graph Data Model Diagram

```
                 (:Contact)
                /   |      \
    [:WORKS_AT]/    |       \[:REFERRED*1..3]
              v     |        v
    (:Company)      |       (:Contact)
              ^     |        /        \
[:FOR_COMPANY]|     |       /          \
              |     |[:MANAGES]         \[:INFLUENCES]
              |     v          v
              +---- (:Deal) <---+
```

### Nodes
- **`Contact`**: `{id, name, email, title, company}`
- **`Company`**: `{id, name, industry, region}`
- **`Deal`**: `{id, title, value, stage}`

### Relationships
- `(:Contact)-[:WORKS_AT]->(:Company)`
- `(:Contact)-[:REFERRED {note, date}]->(:Contact)` *(Referral chain connection)*
- `(:Contact)-[:MANAGES]->(:Deal)`
- `(:Contact)-[:INFLUENCES]->(:Deal)`
- `(:Deal)-[:FOR_COMPANY]->(:Company)`

---

## ⚡ Key Cypher Queries Explained

### 1. Multi-Hop Referral Traversal (2+ Hops)
This query traverses variable-length referral relationships (`*1..3`) to find how contacts in your network are connected to deal decision makers.

```cypher
MATCH path = (source:Contact)-[:REFERRED*1..3]->(target:Contact)
OPTIONAL MATCH (target)-[:MANAGES|INFLUENCES]->(d:Deal)
RETURN 
  source.name AS source,
  target.name AS target,
  length(path) AS hops,
  [node IN nodes(path) | node.name] AS fullPath,
  d.title AS dealTitle,
  d.value AS dealValue
ORDER BY hops ASC, dealValue DESC;
```

### 2. Parameterized Contact & Referral Creation
Creates nodes and typed relationships using parameterized parameters (no string concatenation).

```cypher
MERGE (c:Contact {email: $email})
ON CREATE SET c.id = randomUUID(), c.name = $name, c.title = $title
ON MATCH SET c.name = $name, c.title = $title

MERGE (comp:Company {name: $companyName})
MERGE (c)-[:WORKS_AT]->(comp)

WITH c
MATCH (ref:Contact {name: $referrerName})
MERGE (ref)-[:REFERRED {date: date()}]->(c)
RETURN c;
```

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **CognoDB Cloud Instance**: Free account at [console.cognodb.com](https://console.cognodb.com/signup)

### 1. Set Up CognoDB Cloud Database
1. Sign up at [https://console.cognodb.com/signup](https://console.cognodb.com/signup) (free tier requires no credit card).
2. Create a free **(c0)** instance in your region.
3. Save your **Connection URI** (e.g. `bolt+s://<instance-id>.databases.cognodb.cloud`) and password for user `cognodb`.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your CognoDB credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-saved-password>
PORT=5000
```

### 3. Seed Database
Run the seed script to populate realistic sample nodes and relationships into your CognoDB instance:

```bash
npm run seed
```

### 4. Launch Application
Start both the Express backend and React Vite frontend concurrently:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🖥️ Application Features & UI

1. **📊 Deals & Pipeline Overview**: High-level sales metrics, win rate, total deal pipeline, and referral attribution tags.
2. **🔗 Multi-Hop Referral Explorer**: Visual cards showing 1-hop, 2-hop, and 3-hop introduction paths with an interactive hop depth filter and Cypher inspector.
3. **Layers Interactive Visual Graph Canvas**: Drag-and-drop node graph (`vis-network`) to visually explore node clusters, relationships, and property inspector panel.
4. **➕ Add Contact Modal**: Live parameterized form to add new contacts and build referral links in real-time.

---

## 📦 Deployment & Submission Details

- **GitHub Repository**: Hosted source code, seed scripts, and documentation.
- **Hosted Demo**: Deployable on Vercel / Render / Railway.
- **Submission Email**: Sent to `hr@wexa.ai` with subject `CognoDB Assignment 2 – <Name>`.
