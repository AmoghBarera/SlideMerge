import React from 'react';

export default function SlideRangePicker({ fileId, slideRange, onChange }) {
  return (
    <div className="flex items-center space-x-3 mt-3 bg-white/50 p-2 rounded-lg border border-stone-200">
      <label className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Pages / Slides</label>
      <input
        type="text"
        placeholder="All (or e.g. 1-3, 5)"
        value={slideRange === 'all' ? '' : slideRange}
        onChange={(e) => {
          const val = e.target.value;
          onChange(fileId, val.trim() === '' ? 'all' : val);
        }}
        className="flex-1 px-3 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded-md text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
      />
    </div>
  );
}
