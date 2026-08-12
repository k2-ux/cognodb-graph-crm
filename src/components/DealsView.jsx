import React, { useState } from 'react';
import { DollarSign, Briefcase, UserCheck, Share2, Search, ArrowUpRight, Building2 } from 'lucide-react';

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
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm mt-4">Loading Deals & Graph Relationships...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Active CRM Deals</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Closed Won</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">${closedWonValue.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">
            {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'Closed Won').length / deals.length) * 100) : 0}% Win Rate
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Deals</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{deals.length}</div>
          <div className="text-xs text-slate-400 mt-1">Across {new Set(deals.map(d => d.company)).size} Companies</div>
        </div>

        {/* Card 4 */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Referral Driven</span>
            <Share2 className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-white">{referralInfluencedCount}</div>
          <div className="text-xs text-pink-400 mt-1 font-medium">
            Multi-Hop Referral Sourced
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search deals, companies, manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">Stage:</span>
          {['All', 'Closed Won', 'Qualified', 'Lead'].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                stageFilter === stage
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="font-semibold text-white text-base">Pipeline & Relationship Origins</h2>
          <span className="text-xs text-slate-400">Showing {filteredDeals.length} Deals</span>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>No deals found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Deal Name</th>
                  <th className="px-6 py-3.5">Target Company</th>
                  <th className="px-6 py-3.5">Deal Value</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Account Contact</th>
                  <th className="px-6 py-3.5">Referral Source (Cypher Hop)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {deal.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {deal.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      ${deal.value ? deal.value.toLocaleString() : 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        deal.stage === 'Closed Won'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : deal.stage === 'Qualified'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {deal.manager}
                    </td>
                    <td className="px-6 py-4">
                      {deal.referrer && deal.referrer !== 'Direct Search' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          <Share2 className="w-3 h-3 text-purple-400" />
                          Referred by {deal.referrer}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Direct Contact</span>
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
