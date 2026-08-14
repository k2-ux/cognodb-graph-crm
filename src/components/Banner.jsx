import React from 'react';
import { Database, Info, ExternalLink } from 'lucide-react';

export default function Banner({ dbStatus }) {
  if (dbStatus?.connected) {
    return (
      <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-200 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold tracking-wide">Live CognoDB Graph Instance Active:</span>
          <span>Queries are executing natively via openCypher over Bolt protocol.</span>
        </div>
        <a
          href="https://console.cognodb.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:underline text-amber-300 font-bold tracking-wide"
        >
          CognoDB Console <ExternalLink className="w-3 h-3 text-amber-400" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/90 border-b border-amber-500/40 px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-amber-100 backdrop-blur-md">
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-300 tracking-wide uppercase">Displaying Interactive Preview Data</span>
          <p className="text-amber-200/90 mt-0.5 font-medium">
            To connect your live CognoDB instance, create a free instance at{' '}
            <a href="https://console.cognodb.com" target="_blank" rel="noreferrer" className="text-amber-300 underline font-bold">
              console.cognodb.com
            </a>{' '}
            and add your <code className="bg-black/80 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/40">COGNODB_URI</code> &{' '}
            <code className="bg-black/80 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/40">COGNODB_PASSWORD</code> to <code className="bg-black/80 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/40">.env</code>.
          </p>
        </div>
      </div>
      <a
        href="https://console.cognodb.com/signup"
        target="_blank"
        rel="noreferrer"
        className="px-4 py-1.5 rounded-lg gradient-gold-bg text-amber-950 font-bold hover-gold-glow shadow-md border border-amber-200/50 shrink-0 transition"
      >
        Sign up for CognoDB Free Tier
      </a>
    </div>
  );
}
