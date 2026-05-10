import React from 'react';

export default function MergeProgress({ progress, currentFile, error }) {
  if (!progress && !currentFile && !error) return null;

  return (
    <div className="mt-8 p-5 bg-slate-800/60 border border-slate-700/50 rounded-2xl shadow-inner">
      
      {error ? (
        <div className="text-rose-400 text-sm bg-rose-400/10 p-4 rounded-xl border border-rose-400/20 flex flex-col">
          <p className="font-bold mb-1 flex items-center"><span className="mr-2">⚠️</span> System Error</p>
          <p className="font-mono text-xs">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm text-slate-300 mb-3 font-medium">
            <span className="truncate pr-4 flex items-center">
              {currentFile === 'Merge Complete!' ? '✨ ' : '⚙️ '}
              {currentFile ? currentFile : 'Initializing Engine...'}
            </span>
            <span className="flex-shrink-0 text-indigo-400 font-bold">{Math.round(progress || 0)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 border border-white/5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}
