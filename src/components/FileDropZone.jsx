import React, { useCallback, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileDropZone({ onFilesAdded }) {
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const filterPptxFiles = (files) => {
    return files.filter(f => f.name.toLowerCase().endsWith('.pptx') || f.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = filterPptxFiles(Array.from(e.dataTransfer.files));
      if (validFiles.length > 0) onFilesAdded(validFiles);
    }
  }, [onFilesAdded]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = filterPptxFiles(Array.from(e.target.files));
      if (validFiles.length > 0) onFilesAdded(validFiles);
    }
    e.target.value = null;
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-white hover:bg-blue-50"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        multiple
        accept=".pptx"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-700 font-medium text-center">
        Drag & drop .pptx files here, or click to select files
      </p>
      <p className="text-gray-400 text-sm mt-2 text-center">
        Files are processed locally in your browser
      </p>
    </div>
  );
}
