import React from 'react';
import { Crown, Network, Briefcase, Plus, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, dbStatus, onSeed, onAddContact, isSeeding }) {
  return (
    <header className="glass-nav sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl gradient-gold-bg text-amber-950 shadow-lg shadow-amber-500/25 border border-amber-300/40">
          <Crown className="w-6 h-6 fill-amber-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-royal font-extrabold text-2xl tracking-wider gradient-gold-text uppercase">GraphCRM</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 tracking-wider">
              CognoDB Graph
            </span>
          </div>
          <p className="text-xs text-amber-200/80 font-medium tracking-wide">Referral & Stakeholder Relationship Graph</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-amber-500/30 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('deals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
            activeTab === 'deals'
              ? 'gradient-gold-bg text-amber-950 shadow-lg shadow-amber-500/30 border border-amber-200/50'
              : 'text-amber-200/75 hover:text-amber-100 hover:bg-amber-950/40'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Deals & Leads
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
            activeTab === 'referrals'
              ? 'gradient-gold-bg text-amber-950 shadow-lg shadow-amber-500/30 border border-amber-200/50'
              : 'text-amber-200/75 hover:text-amber-100 hover:bg-amber-950/40'
          }`}
        >
          <Network className="w-4 h-4" />
          Referral Chains (Multi-Hop)
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
            activeTab === 'graph'
              ? 'gradient-gold-bg text-amber-950 shadow-lg shadow-amber-500/30 border border-amber-200/50'
              : 'text-amber-200/75 hover:text-amber-100 hover:bg-amber-950/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          Full Visual Graph
        </button>
      </nav>

      {/* Action Buttons & Connection Badge */}
      <div className="flex items-center gap-3">
        {/* DB Connection Status */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs bg-black/70 border border-amber-500/30">
          {dbStatus?.connected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold tracking-wider uppercase text-[11px]">CognoDB Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px]">Preview Mode (No DB)</span>
            </>
          )}
        </div>

        {/* Seed Database Button */}
        <button
          onClick={onSeed}
          disabled={isSeeding}
          title="Seed graph database with sample data"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-black/70 text-amber-200 hover:text-white hover:bg-amber-950/60 border border-amber-500/40 transition shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSeeding ? 'animate-spin' : ''}`} />
          {isSeeding ? 'Seeding...' : 'Seed Data'}
        </button>

        {/* Add Contact Button */}
        <button
          onClick={onAddContact}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold gradient-gold-bg text-amber-950 hover-gold-glow transition shadow-lg shadow-amber-500/25 border border-amber-200/50"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Contact
        </button>
      </div>
    </header>
  );
}
