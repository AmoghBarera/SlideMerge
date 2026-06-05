import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import FileDropZone from './components/FileDropZone';
import FileQueue from './components/FileQueue';
import MergeProgress from './components/MergeProgress';
import PreviewPanel from './components/PreviewPanel';
import { mergePptxFiles } from './lib/pptxMerger';
import { mergePdfFiles } from './lib/pdfMerger';

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
    
    setFiles(prev => {
      const all = [...prev, ...newWrappers];
      const hasPdf = all.some(f => f.file.name.toLowerCase().endsWith('.pdf'));
      const hasPptx = all.some(f => f.file.name.toLowerCase().endsWith('.pptx'));
      if (hasPdf && hasPptx) {
        setError("Please merge only PDFs or only PPTXs at the same time.");
      } else {
        setError(null);
      }
      return all;
    });
    setProgress(0);
    setCurrentFile(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    const hasPdf = files.some(f => f.file.name.toLowerCase().endsWith('.pdf'));
    const hasPptx = files.some(f => f.file.name.toLowerCase().endsWith('.pptx'));
    
    if (hasPdf && hasPptx) {
       setError("Cannot mix PDFs and PPTXs. Please remove one type.");
       return;
    }

    setIsMerging(true);
    setError(null);
    setProgress(0);

    try {
      let blob;
      if (hasPdf) {
        blob = await mergePdfFiles(files, (status) => {
          if (status.file) setCurrentFile(status.file);
          if (typeof status.progress === 'number') setProgress(status.progress);
        });
      } else {
        blob = await mergePptxFiles(files, (status) => {
          if (status.file) setCurrentFile(status.file);
          if (typeof status.progress === 'number') setProgress(status.progress);
        });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = hasPdf ? 'Merged_Document.pdf' : 'Merged_Presentation.pptx';
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Premium Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-200 to-stone-400 flex items-center justify-center shadow-lg shadow-stone-500/20">
            <Layers className="text-stone-800 w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-stone-800 tracking-tight">SlideMerge</span>
        </div>
        <button className="px-5 py-2 rounded-full bg-stone-900/5 hover:bg-stone-900/10 border border-stone-900/10 text-stone-800 text-sm font-semibold transition-all backdrop-blur-md">
          Unlock Pro
        </button>
      </header>

      <main className="w-full max-w-3xl space-y-8 z-10">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            100% Secure & Private
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
            Merge Decks & PDFs. <br className="hidden md:block"/>
            <span className="premium-gradient-text">Zero Compromise.</span>
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto">
            Combine multiple PowerPoint or PDF files directly in your browser. Unmatched fidelity, instant processing, and absolute privacy.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/40 blur-3xl rounded-full pointer-events-none"></div>
          
          <FileDropZone onFilesAdded={handleFilesAdded} />
          
          <FileQueue files={files} setFiles={setFiles} />
          
          <PreviewPanel files={files} />
          
          <MergeProgress progress={progress} currentFile={currentFile} error={error} />

          <div className="mt-10 pt-8 border-t border-stone-200/50 flex justify-end">
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isMerging || error}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all flex items-center space-x-2
                ${files.length < 2 || isMerging || error
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300/50'
                  : 'bg-gradient-to-r from-stone-800 to-stone-900 text-white hover:from-stone-700 hover:to-stone-800 shadow-xl shadow-stone-900/20 hover:shadow-stone-900/30 hover:-translate-y-0.5'
                }
              `}
            >
              {isMerging ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Merging Engine...</span>
                </>
              ) : (
                <span>Merge & Download</span>
              )}
            </button>
          </div>
        </div>
        
        <p className="text-center text-stone-500 text-sm mt-8">
          Free tier limit: Supports up to 200MB locally. <a href="#" className="text-amber-700 hover:text-amber-800 underline underline-offset-4">Upgrade to Pro</a> for unlimited rendering.
        </p>
      </main>
    </div>
  );
}
