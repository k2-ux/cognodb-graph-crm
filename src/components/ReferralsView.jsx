import React, { useState } from 'react';
import { Share2, ArrowRight, Code, Layers, Zap, Info, Crown } from 'lucide-react';

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
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        <p className="text-amber-200/80 text-sm font-medium mt-4">Traversing Graph Relationships in CognoDB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Feature Header */}
      <div className="glass-card p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl gradient-gold-bg text-amber-950 shadow-md shadow-amber-500/25 border border-amber-200/50">
              <Zap className="w-5 h-5 fill-amber-950" />
            </span>
            <h2 className="text-lg font-accent font-extrabold text-amber-300 tracking-wide uppercase">Multi-Hop Referral Network Explorer</h2>
          </div>
          <p className="text-sm text-amber-100/90 mt-2 max-w-2xl leading-relaxed font-medium">
            In standard SQL, finding multi-degree connection paths (e.g. <em>"Who introduced whom across 2 or 3 hops to reach a key deal decision maker?"</em>) requires complex nested JOINs. In CognoDB Graph DB, Cypher traverses paths natively using <code className="text-amber-300 bg-black/70 px-2 py-0.5 rounded border border-amber-500/40 font-mono text-xs">[:REFERRED*1..3]</code>.
          </p>
        </div>

        {/* Hop Filter Switcher */}
        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-amber-500/30 shrink-0 backdrop-blur-md">
          <span className="text-xs text-amber-200/80 px-2 font-bold font-accent">Hop Depth:</span>
          {['All', '1', '2+'].map(val => (
            <button
              key={val}
              onClick={() => setHopFilter(val)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                hopFilter === val
                  ? 'gradient-gold-bg text-amber-950 shadow-md shadow-amber-500/30 border border-amber-200/50'
                  : 'text-amber-200/75 hover:text-white hover:bg-amber-950/40'
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
          <div key={idx} className="glass-card p-5 rounded-2xl space-y-4 hover:border-amber-400/50 transition">
            {/* Header / Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  item.hops === 1
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                }`}>
                  {item.hops === 1 ? '1-Hop Direct Referral' : `${item.hops}-Hop Multi-Hop Path`}
                </span>
              </div>
              {item.dealValue && (
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40">
                  ${item.dealValue.toLocaleString()} Deal Value
                </span>
              )}
            </div>

            {/* Path Visualizer Flow */}
            <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30 space-y-2">
              <div className="text-xs text-amber-300/70 uppercase font-bold tracking-wider font-accent">Referral Path</div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-400/40">
                  {item.source}
                </span>

                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />

                {item.via && (
                  <>
                    <span className="font-semibold text-amber-100 bg-amber-950/70 px-3 py-1 rounded-lg border border-amber-500/30">
                      Via {item.via}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                  </>
                )}

                <span className="font-bold text-amber-200 bg-amber-500/25 px-3 py-1 rounded-lg border border-amber-400/50">
                  {item.target}
                </span>
              </div>

              {item.dealTitle && (
                <div className="mt-3 pt-2.5 border-t border-amber-500/20 text-xs text-amber-100 flex items-center justify-between">
                  <span className="text-amber-200/80 font-bold">Associated Deal:</span>
                  <span className="font-extrabold text-white">{item.dealTitle}</span>
                </div>
              )}
            </div>

            {item.note && (
              <p className="text-xs text-amber-200/80 italic font-medium">
                "{item.note}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Cypher Query Inspector Box */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
          <Code className="w-4 h-4 text-amber-400" />
          <span className="font-accent uppercase tracking-wider">Executed openCypher Multi-Hop Query (Parameterized)</span>
        </div>
        <pre className="bg-black/80 p-4 rounded-xl border border-amber-500/35 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
          {cypherQuerySnippet}
        </pre>
      </div>
    </div>
  );
}
