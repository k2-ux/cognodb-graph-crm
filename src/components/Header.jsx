import React from 'react';
import { Database, Network, Briefcase, Plus, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, dbStatus, onSeed, onAddContact, isSeeding }) {
  return (
    <header className="glass-nav sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-indigo-500/20">
          <Network className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-white tracking-tight">GraphCRM</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              CognoDB Powered
            </span>
          </div>
          <p className="text-xs text-slate-400">Referral & Stakeholder Relationship Intelligence</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('deals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'deals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Deals & Leads
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'referrals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Network className="w-4 h-4" />
          Referral Chains (Multi-Hop)
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'graph'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Full Visual Graph
        </button>
      </nav>

      {/* Action Buttons & Connection Badge */}
      <div className="flex items-center gap-3">
        {/* DB Connection Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800">
          {dbStatus?.connected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">CognoDB Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-medium">Preview Mode (No DB)</span>
            </>
          )}
        </div>

        {/* Seed Database Button */}
        <button
          onClick={onSeed}
          disabled={isSeeding}
          title="Seed graph database with sample data"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          {isSeeding ? 'Seeding...' : 'Seed Data'}
        </button>

        {/* Add Contact Button */}
        <button
          onClick={onAddContact}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold gradient-bg text-white hover-glow transition"
        >
          <Plus className="w-4 h-4" />
          New Contact
        </button>
      </div>
    </header>
  );
}
