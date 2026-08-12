import React, { useState } from 'react';
import { Share2, ArrowRight, Code, Layers, Zap, Info } from 'lucide-react';

export default function ReferralsView({ referrals, isLoading }) {
  const [hopFilter, setHopFilter] = useState('All');

  const filteredReferrals = referrals.filter(r => {
    if (hopFilter === '1') return r.hops === 1;
    if (hopFilter === '2+') return r.hops >= 2;
    return true;
  });

  const cypherQuerySnippet = `
// 2+ Hop Graph Traversal in CognoDB Cloud (openCypher)
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
  `.trim();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm mt-4">Traversing Graph Relationships in CognoDB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Feature Header */}
      <div className="glass-card p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Multi-Hop Referral Network Explorer</h2>
          </div>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            In standard SQL, finding multi-degree connection paths (e.g. <em>"Who introduced whom across 2 or 3 hops to reach a key deal decision maker?"</em>) requires complex nested JOINs. In CognoDB Graph DB, Cypher traverses paths natively using <code className="text-purple-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-xs">[:REFERRED*1..3]</code>.
          </p>
        </div>

        {/* Hop Filter Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <span className="text-xs text-slate-400 px-2 font-medium">Hop Depth:</span>
          {['All', '1', '2+'].map(val => (
            <button
              key={val}
              onClick={() => setHopFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                hopFilter === val
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {val === 'All' ? 'All Hops' : val === '1' ? '1-Hop Direct' : '2+ Hop Multi-Traversal'}
            </button>
          ))}
        </div>
      </div>

      {/* Referral Path Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReferrals.map((item, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl space-y-4 hover:border-purple-500/30 transition">
            {/* Header / Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  item.hops === 1
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                }`}>
                  {item.hops === 1 ? '1-Hop Direct Referral' : `${item.hops}-Hop Multi-Hop Path`}
                </span>
              </div>
              {item.dealValue && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ${item.dealValue.toLocaleString()} Deal Value
                </span>
              )}
            </div>

            {/* Path Visualizer Flow */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Referral Path</div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  {item.source}
                </span>

                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                {item.via && (
                  <>
                    <span className="font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                      Via {item.via}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </>
                )}

                <span className="font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  {item.target}
                </span>
              </div>

              {item.dealTitle && (
                <div className="mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Associated Deal:</span>
                  <span className="font-semibold text-white">{item.dealTitle}</span>
                </div>
              )}
            </div>

            {item.note && (
              <p className="text-xs text-slate-400 italic">
                "{item.note}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Cypher Query Inspector Box */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Code className="w-4 h-4 text-purple-400" />
          <span>Executed openCypher Multi-Hop Query (Parameterized)</span>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed">
          {cypherQuerySnippet}
        </pre>
      </div>
    </div>
  );
}
