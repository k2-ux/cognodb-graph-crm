import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { Layers, ZoomIn, ZoomOut, RefreshCw, Info } from 'lucide-react';

export default function GraphExplorer({ graphData, isLoading }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterGroup, setFilterGroup] = useState('All');

  useEffect(() => {
    if (!containerRef.current || isLoading || !graphData?.nodes) return;

    // Filter nodes by group if selected
    const nodes = graphData.nodes
      .filter(n => filterGroup === 'All' || n.group === filterGroup)
      .map(n => {
        let color = '#818cf8'; // default indigo
        let shape = 'dot';
        if (n.group === 'Contact') {
          color = '#818cf8'; // indigo
          shape = 'dot';
        } else if (n.group === 'Company') {
          color = '#34d399'; // emerald
          shape = 'diamond';
        } else if (n.group === 'Deal') {
          color = '#c084fc'; // purple
          shape = 'triangle';
        }

        return {
          id: n.id,
          label: n.label,
          group: n.group,
          shape: shape,
          size: n.group === 'Deal' ? 22 : 18,
          color: {
            background: color,
            border: '#ffffff',
            highlight: { background: '#f472b6', border: '#ffffff' }
          },
          font: { color: '#ffffff', face: 'Inter', size: 12 },
          properties: n.properties || {}
        };
      });

    const nodeIds = new Set(nodes.map(n => n.id));

    // Filter edges to match remaining nodes
    const edges = graphData.edges
      .filter(e => nodeIds.has(e.from) && nodeIds.has(e.to))
      .map(e => ({
        from: e.from,
        to: e.to,
        label: e.label,
        font: { color: '#94a3b8', size: 9, align: 'middle' },
        color: { color: '#334155', highlight: '#a855f7' },
        arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        smooth: { type: 'continuous' }
      }));

    const data = { nodes, edges };

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 1.5,
        shadow: false
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 120,
          springConstant: 0.04
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true
      }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    // Node click handler
    networkRef.current.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeObj = nodes.find(n => n.id === nodeId);
        setSelectedNode(nodeObj || null);
      }
    });

    networkRef.current.on('deselectNode', () => {
      setSelectedNode(null);
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData, filterGroup, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm mt-4">Rendering Interactive Network Canvas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-white text-base">Full Visual Graph Canvas</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {graphData?.nodes?.length || 0} Nodes · {graphData?.edges?.length || 0} Relationships
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Show Node Type:</span>
          {['All', 'Contact', 'Company', 'Deal'].map(group => (
            <button
              key={group}
              onClick={() => setFilterGroup(group)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterGroup === group
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Inspector Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Network Canvas Container */}
        <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden relative min-h-[520px]">
          <div ref={containerRef} className="w-full h-[520px] bg-slate-950/90" />

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block"></span>
              <span>Contact</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rotate-45 bg-emerald-400 inline-block"></span>
              <span>Company</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-purple-400 inline-block"></span>
              <span>Deal</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Side Panel */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              Node Inspector
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                    {selectedNode.group}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{selectedNode.label}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span className="text-slate-500 capitalize">{key}:</span>
                      <span className="font-medium text-white truncate max-w-[140px]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs leading-relaxed">
                Click on any node in the graph canvas to inspect properties and relationship paths.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
            💡 Powered by CognoDB openCypher node labels & typed edge attributes.
          </div>
        </div>
      </div>
    </div>
  );
}
