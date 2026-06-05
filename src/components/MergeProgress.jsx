import React from 'react';

export default function MergeProgress({ progress, currentFile, error }) {
  if (!progress && !currentFile && !error) return null;

  return (
    <div className="mt-8 p-5 bg-white/60 border border-stone-200/50 rounded-2xl shadow-inner">
      
      {error ? (
        <div className="text-rose-600 text-sm bg-rose-50 p-4 rounded-xl border border-rose-200 flex flex-col">
          <p className="font-bold mb-1 flex items-center"><span className="mr-2">⚠️</span> System Error</p>
          <p className="font-mono text-xs">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm text-stone-600 mb-3 font-medium">
            <span className="truncate pr-4 flex items-center">
              {currentFile === 'Merge Complete!' ? '✨ ' : '⚙️ '}
              {currentFile ? currentFile : 'Initializing Engine...'}
            </span>
            <span className="flex-shrink-0 text-amber-700 font-bold">{Math.round(progress || 0)}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-3 border border-stone-300 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-stone-700 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(217,119,6,0.3)]"
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}
