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
      className="group relative border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-sm"
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
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-700">
        <UploadCloud className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-xl text-white font-semibold text-center mb-2">
        Upload presentations
      </h3>
      <p className="text-slate-400 text-sm mt-1 text-center max-w-sm">
        Drag & drop your .pptx files here, or <span className="text-indigo-400 font-medium group-hover:underline">browse files</span>
      </p>
    </div>
  );
}
