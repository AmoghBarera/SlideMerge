import React from 'react';

export default function PreviewPanel({ files }) {
  if (files.length === 0) return null;

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <div className="mt-8 p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-sm backdrop-blur-sm">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">System Summary</h3>
      <div className="flex flex-col space-y-2 text-sm text-slate-300">
        <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
          <span className="flex items-center"><span className="mr-2">📄</span> Total Files:</span>
          <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">{totalFiles}</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
          <span className="flex items-center"><span className="mr-2">💾</span> Memory Payload:</span>
          <span className={`font-bold px-2.5 py-0.5 rounded-md border ${totalSize > 200 * 1024 * 1024 ? 'text-rose-400 bg-rose-400/10 border-rose-400/20' : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'}`}>
            {totalSizeMB} MB
          </span>
        </div>
      </div>
      {totalSize > 200 * 1024 * 1024 && (
        <div className="mt-4 text-xs text-amber-200 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
          <span className="font-bold mr-1">Heads up:</span> Total file size exceeds 200 MB. The processing engine handles this, but it may take a few seconds depending on your device's memory limits.
        </div>
      )}
    </div>
  );
}
