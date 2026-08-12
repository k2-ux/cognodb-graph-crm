import React from 'react';
import { Database, Info, ExternalLink } from 'lucide-react';

export default function Banner({ dbStatus }) {
  if (dbStatus?.connected) {
    return (
      <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold">Live CognoDB Graph Instance Active:</span>
          <span>Queries are executing natively via openCypher over Bolt protocol.</span>
        </div>
        <a
          href="https://console.cognodb.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:underline text-emerald-200"
        >
          CognoDB Console <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-indigo-950/60 border-b border-indigo-800/40 px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-indigo-200">
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-100">Displaying Interactive Preview Data</span>
          <p className="text-slate-300 mt-0.5">
            To connect your live CognoDB instance, create a free instance at{' '}
            <a href="https://console.cognodb.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-medium">
              console.cognodb.com
            </a>{' '}
            and add your <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">COGNODB_URI</code> &{' '}
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">COGNODB_PASSWORD</code> to <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">.env</code>.
          </p>
        </div>
      </div>
      <a
        href="https://console.cognodb.com/signup"
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow shrink-0 transition"
      >
        Sign up for CognoDB Free Tier
      </a>
    </div>
  );
}
