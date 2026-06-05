import { PDFDocument } from 'pdf-lib';

export async function mergePdfFiles(fileWrappers, onProgress) {
  if (fileWrappers.length === 0) throw new Error("No files to merge.");

  onProgress({ file: 'Initializing PDF Engine...', progress: 0 });
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < fileWrappers.length; i++) {
    const wrapper = fileWrappers[i];
    onProgress({ file: `Merging ${wrapper.file.name}...`, progress: (i / fileWrappers.length) * 100 });
    
    try {
      const arrayBuffer = await wrapper.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      console.error(`Failed to merge PDF ${wrapper.file.name}:`, err);
    }
  }

  onProgress({ file: 'Finalizing PDF...', progress: 100 });
  
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
