import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import DealsView from './components/DealsView';
import ReferralsView from './components/ReferralsView';
import GraphExplorer from './components/GraphExplorer';
import AddContactModal from './components/AddContactModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('deals');
  const [dbStatus, setDbStatus] = useState(null);
  const [deals, setDeals] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch DB Health Status
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setDbStatus(healthData.database);

      // 2. Fetch Deals
      const dealsRes = await fetch('/api/deals');
      const dealsJson = await dealsRes.json();
      setDeals(dealsJson.data || []);

      // 3. Fetch Multi-Hop Referrals
      const referralsRes = await fetch('/api/referrals');
      const referralsJson = await referralsRes.json();
      setReferrals(referralsJson.data || []);

      // 4. Fetch Full Graph Visualization Data
      const graphRes = await fetch('/api/graph');
      const graphJson = await graphRes.json();
      setGraphData(graphJson.data || { nodes: [], edges: [] });

    } catch (err) {
      console.error('Error fetching graph application data:', err);
      showToast('Failed to connect to backend server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'Database successfully seeded!');
        await fetchAllData();
      } else {
        showToast(json.error || 'Failed to seed database.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddContact = async (formData) => {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Error saving contact');
    }
    showToast(`Added contact "${formData.name}" to graph database!`);
    await fetchAllData();
  };

  // Extract contact list for the referrer dropdown
  const contactsList = Array.from(
    new Set([
      ...deals.map(d => ({ name: d.manager, title: 'Contact' })),
      ...referrals.map(r => ({ name: r.source, title: 'Referrer' })),
      ...referrals.map(r => ({ name: r.target, title: 'Contact' }))
    ].filter(c => c.name && c.name !== 'Unassigned'))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <Banner dbStatus={dbStatus} />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        onSeed={handleSeed}
        onAddContact={() => setIsAddModalOpen(true)}
        isSeeding={isSeeding}
      />

      {/* Notification Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 transition-all animate-bounce ${
          toast.type === 'error'
            ? 'bg-red-950/90 text-red-200 border-red-800'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'deals' && (
          <DealsView deals={deals} isLoading={isLoading} />
        )}

        {activeTab === 'referrals' && (
          <ReferralsView referrals={referrals} isLoading={isLoading} />
        )}

        {activeTab === 'graph' && (
          <GraphExplorer graphData={graphData} isLoading={isLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Built with CognoDB Cloud (openCypher / Neo4j Bolt) & React</p>
      </footer>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
        contacts={contactsList}
      />
    </div>
  );
}
