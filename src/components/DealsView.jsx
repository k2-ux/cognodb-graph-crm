import React, { useState } from 'react';
import { DollarSign, Briefcase, UserCheck, Share2, Search, ArrowUpRight, Building2, Crown } from 'lucide-react';

export default function DealsView({ deals, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const filteredDeals = deals.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || d.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const closedWonValue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + (d.value || 0), 0);
  const referralInfluencedCount = deals.filter(d => d.referrer && d.referrer !== 'Direct Search').length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        <p className="text-amber-200/80 text-sm font-medium mt-4">Loading Deals & Graph Relationships...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-200/75 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest font-accent">Total Pipeline</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black gradient-gold-text">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-amber-200/70 mt-1 flex items-center gap-1 font-semibold">
            <span className="text-emerald-400">Active CRM Deals</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-amber-200/75 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest font-accent">Closed Won</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">${closedWonValue.toLocaleString()}</div>
          <div className="text-xs text-amber-200/70 mt-1 font-semibold">
            {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'Closed Won').length / deals.length) * 100) : 0}% Win Rate
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-amber-200/75 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest font-accent">Total Deals</span>
            <UserCheck className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-black text-amber-100">{deals.length}</div>
          <div className="text-xs text-amber-200/70 mt-1 font-semibold">Across {new Set(deals.map(d => d.company)).size} Companies</div>
        </div>

        {/* Card 4 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-amber-200/75 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest font-accent">Referral Driven</span>
            <Share2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{referralInfluencedCount}</div>
          <div className="text-xs text-amber-200/80 mt-1 font-bold">
            Multi-Hop Referral Sourced
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-amber-400/70" />
          <input
            type="text"
            placeholder="Search deals, companies, manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-amber-500/30 rounded-xl pl-10 pr-4 py-2 text-sm text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-amber-200/80 font-bold uppercase font-accent tracking-wider">Stage:</span>
          {['All', 'Closed Won', 'Qualified', 'Lead'].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                stageFilter === stage
                  ? 'gradient-gold-bg text-amber-950 shadow-md shadow-amber-500/30 border border-amber-200/50'
                  : 'bg-black/50 text-amber-200/70 hover:text-white border border-amber-500/30'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <h2 className="font-accent font-extrabold text-amber-300 text-lg tracking-wide uppercase">Pipeline & Relationship Origins</h2>
          <span className="text-xs text-amber-200/70 font-semibold">Showing {filteredDeals.length} Deals</span>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="p-12 text-center text-amber-200/60 font-medium">
            <p>No deals found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-amber-50">
              <thead className="bg-black/70 text-xs uppercase font-extrabold text-amber-300/90 border-b border-amber-500/30 font-accent tracking-wider">
                <tr>
                  <th className="px-6 py-4">Deal Name</th>
                  <th className="px-6 py-4">Target Company</th>
                  <th className="px-6 py-4">Deal Value</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Account Contact</th>
                  <th className="px-6 py-4">Referral Source (Cypher Hop)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/15">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-amber-950/40 transition">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        {deal.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-amber-100">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        {deal.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-amber-300">
                      ${deal.value ? deal.value.toLocaleString() : 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        deal.stage === 'Closed Won'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : deal.stage === 'Qualified'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-amber-100 font-semibold">
                      {deal.manager}
                    </td>
                    <td className="px-6 py-4">
                      {deal.referrer && deal.referrer !== 'Direct Search' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                          <Share2 className="w-3 h-3 text-amber-400" />
                          Referred by {deal.referrer}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-200/50 font-medium">Direct Contact</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
