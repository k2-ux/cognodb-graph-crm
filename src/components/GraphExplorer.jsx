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
        let color = '#f59e0b'; // Royal Gold
        let shape = 'dot';
        if (n.group === 'Contact') {
          color = '#10b981'; // Emerald
          shape = 'dot';
        } else if (n.group === 'Company') {
          color = '#fef08a'; // Pearl Champagne
          shape = 'diamond';
        } else if (n.group === 'Deal') {
          color = '#f59e0b'; // Royal Gold
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
            highlight: { background: '#fbbf24', border: '#ffffff' }
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
        font: { color: '#fef08a', size: 9, align: 'middle' },
        color: { color: '#b45309', highlight: '#f59e0b' },
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
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        <p className="text-amber-200/80 text-sm font-medium mt-4">Rendering Interactive Network Canvas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h2 className="font-royal font-bold text-white text-base tracking-wide uppercase">Full Visual Graph Canvas</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-500/40 font-bold">
            {graphData?.nodes?.length || 0} Nodes · {graphData?.edges?.length || 0} Relationships
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-200/80 font-bold uppercase font-royal">Show Node Type:</span>
          {['All', 'Contact', 'Company', 'Deal'].map(group => (
            <button
              key={group}
              onClick={() => setFilterGroup(group)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                filterGroup === group
                  ? 'gradient-gold-bg text-amber-950 shadow-md shadow-amber-500/30 border border-amber-200/50'
                  : 'bg-black/50 text-amber-200/75 hover:text-white border border-amber-500/30'
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
          <div ref={containerRef} className="w-full h-[520px] bg-black/80" />

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur border border-amber-500/40 p-3 rounded-xl flex items-center gap-4 text-xs text-amber-100 font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <span>Contact</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rotate-45 bg-yellow-200 inline-block"></span>
              <span>Company</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 inline-block"></span>
              <span>Deal</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Side Panel */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase font-royal tracking-wider mb-3">
              <Info className="w-4 h-4 text-amber-400" />
              Node Inspector
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-black/60 rounded-xl border border-amber-500/40">
                  <span className="text-xs px-2.5 py-0.5 rounded gradient-gold-bg text-amber-950 font-extrabold">
                    {selectedNode.group}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 font-royal tracking-wide">{selectedNode.label}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-amber-500/20 text-amber-100">
                      <span className="text-amber-200/80 capitalize font-semibold">{key}:</span>
                      <span className="font-bold text-white truncate max-w-[140px]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-amber-200/70 text-xs leading-relaxed font-medium">
                Click on any node in the graph canvas to inspect properties and relationship paths.
              </div>
            )}
          </div>

          <div className="text-[11px] text-amber-200/70 bg-black/50 p-3 rounded-xl border border-amber-500/30 font-medium">
            💡 Powered by CognoDB openCypher node labels & typed edge attributes.
          </div>
        </div>
      </div>
    </div>
  );
}
