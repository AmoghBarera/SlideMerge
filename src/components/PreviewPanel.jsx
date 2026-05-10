import React from 'react';

export default function PreviewPanel({ files }) {
  if (files.length === 0) return null;

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-md font-medium text-gray-800 mb-2">Summary</h3>
      <div className="flex flex-col space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Total Files:</span>
          <span className="font-medium text-gray-900">{totalFiles}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Total Size:</span>
          <span className={`font-medium ${totalSize > 200 * 1024 * 1024 ? 'text-red-500' : 'text-gray-900'}`}>
            {totalSizeMB} MB
          </span>
        </div>
      </div>
      {totalSize > 200 * 1024 * 1024 && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          Warning: Total file size exceeds 200 MB. Processing may take a while or fail depending on your browser's memory limits.
        </div>
      )}
    </div>
  );
}
