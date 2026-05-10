import React from 'react';

export default function SlideRangePicker({ fileId, slideRange, onChange }) {
  return (
    <div className="flex items-center space-x-3 mt-3 bg-slate-800/50 p-2 rounded-lg border border-white/5">
      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Slides</label>
      <input
        type="text"
        placeholder="All slides (or e.g. 1-3, 5)"
        value={slideRange === 'all' ? '' : slideRange}
        onChange={(e) => {
          const val = e.target.value;
          onChange(fileId, val.trim() === '' ? 'all' : val);
        }}
        className="flex-1 px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
      />
    </div>
  );
}
