import React from 'react';

export default function MergeProgress({ progress, currentFile, error }) {
  if (!progress && !currentFile && !error) return null;

  return (
    <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-md font-medium text-gray-800 mb-2">Merge Status</h3>
      
      {error ? (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span className="truncate pr-2">{currentFile ? `Processing: ${currentFile}` : 'Initializing...'}</span>
            <span className="flex-shrink-0">{Math.round(progress || 0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}
