import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import FileDropZone from './components/FileDropZone';
import FileQueue from './components/FileQueue';
import MergeProgress from './components/MergeProgress';
import PreviewPanel from './components/PreviewPanel';
import { mergePptxFiles } from './lib/pptxMerger';

export default function App() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesAdded = (newFiles) => {
    const newWrappers = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      slideRange: 'all'
    }));
    setFiles(prev => [...prev, ...newWrappers]);
    setError(null);
    setProgress(0);
    setCurrentFile(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsMerging(true);
    setError(null);
    setProgress(0);

    try {
      const blob = await mergePptxFiles(files, (status) => {
        if (status.file) setCurrentFile(status.file);
        if (typeof status.progress === 'number') setProgress(status.progress);
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Merged_Presentation.pptx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      setCurrentFile('Merge Complete!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during merge.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <Layers className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            PowerPoint Merger
          </h1>
          <p className="mt-2 text-gray-600">
            Merge multiple .pptx files directly in your browser. 100% private and secure.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
          <FileDropZone onFilesAdded={handleFilesAdded} />
          
          <FileQueue files={files} setFiles={setFiles} />
          
          <PreviewPanel files={files} />
          
          <MergeProgress progress={progress} currentFile={currentFile} error={error} />

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isMerging}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all
                ${files.length < 2 || isMerging
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }
              `}
            >
              {isMerging ? 'Merging...' : 'Merge & Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
