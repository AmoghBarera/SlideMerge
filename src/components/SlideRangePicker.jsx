import React from 'react';

export default function SlideRangePicker({ fileId, slideRange, onChange }) {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <label className="text-sm text-gray-600 font-medium">Slides:</label>
      <input
        type="text"
        placeholder="e.g. 1-3, 5, 7 or leave blank for all"
        value={slideRange === 'all' ? '' : slideRange}
        onChange={(e) => {
          const val = e.target.value;
          onChange(fileId, val.trim() === '' ? 'all' : val);
        }}
        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
