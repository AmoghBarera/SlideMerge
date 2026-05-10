/*
  =============================================================================
  PPTX ZIP Structure & Merge Algorithm
  =============================================================================
  A .pptx file is an OpenXML ZIP archive containing various XML parts:
  
  [Content_Types].xml: Manifest of all file types/parts in the package.
  _rels/.rels: Root relationships linking to the main presentation.xml.
  ppt/presentation.xml: The main entry point. Defines slide list (p:sldIdLst), slide sizes, etc.
  ppt/_rels/presentation.xml.rels: Links the presentation to slides, masters, themes.
  ppt/slides/slideN.xml: The actual slide content.
  ppt/slides/_rels/slideN.xml.rels: Links a slide to its layout, media, notes, etc.
  ppt/slideLayouts/layoutN.xml: Defines placeholders and styles for slides.
  ppt/slideMasters/masterN.xml: Defines base formatting and background for layouts.
  ppt/theme/themeN.xml: Defines colors, fonts, and graphical effects.
  ppt/media/*: Embedded images, videos, audio.

  MERGE ALGORITHM (Direct ZIP Manipulation):
  1. Base Archive: We use the FIRST presentation in the queue as the base. We load it into JSZip.
     We parse its `[Content_Types].xml` and `ppt/presentation.xml`.
  2. Slide Extraction: For each subsequent presentation, we load it into a temporary JSZip instance.
     We parse its `ppt/presentation.xml` to find the order of its slides.
  3. Range Filtering: We filter the source slides based on the user's selected range (e.g., "1-3, 5").
  4. Part Copying & Renaming: For each included slide:
     - We copy `slideN.xml` to the base archive under a new unique name.
     - We copy its relationships file `slideN.xml.rels`.
     - We traverse its relationships to copy referenced layouts, masters, themes, and media.
     - To avoid collisions (e.g. both files have `image1.png`), we prepend a unique file ID to copied assets.
  5. Relationship Remapping: 
     - We update all `rId`s in the copied XMLs to ensure they correctly point to the renamed assets.
     - We add new slide relationships to the base `ppt/_rels/presentation.xml.rels`.
  6. Content Types: We register all new part names (slides, layouts, masters, etc.) in the base `[Content_Types].xml`.
  7. Presentation XML Update: We append the new slide `rId`s to the base `<p:sldIdLst>` in `ppt/presentation.xml`.
  8. Output: We generate a new Blob from the modified base JSZip archive.
  =============================================================================
*/

import JSZip from 'jszip';
import { ContentTypesBuilder } from './contentTypesBuilder';
import { RelationshipBuilder } from './relationshipUtils';
import { MediaDeduplicator } from './mediaDeduplicator';

function parseRange(rangeStr, maxSlides) {
  if (!rangeStr || rangeStr === 'all') {
    return Array.from({ length: maxSlides }, (_, i) => i + 1);
  }
  const result = new Set();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes('-')) {
      const [startStr, endStr] = p.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxSlides) result.add(i);
        }
      }
    } else {
      const num = parseInt(p, 10);
      if (!isNaN(num) && num >= 1 && num <= maxSlides) {
        result.add(num);
      }
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

function getRelsPath(xmlPath) {
  const parts = xmlPath.split('/');
  const filename = parts.pop();
  return `${parts.join('/')}/_rels/${filename}.rels`;
}

function resolvePath(basePath, relativePath) {
  const parts = basePath.split('/');
  parts.pop(); 
  const relParts = relativePath.split('/');
  for (const part of relParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }
  return parts.join('/');
}

export async function mergePptxFiles(fileWrappers, onProgress) {
  if (fileWrappers.length === 0) throw new Error("No files to merge.");

  let totalSlidesToProcess = 0;
  let slidesProcessed = 0;

  const metadata = [];
  for (let i = 0; i < fileWrappers.length; i++) {
    onProgress({ file: `Analyzing ${fileWrappers[i].file.name}...`, progress: 0 });
    const zip = new JSZip();
    await zip.loadAsync(fileWrappers[i].file);
    
    const presXmlStr = await zip.file('ppt/presentation.xml').async('string');
    const parser = new DOMParser();
    const presDoc = parser.parseFromString(presXmlStr, 'text/xml');
    
    const sldIdLst = presDoc.getElementsByTagName('p:sldIdLst')[0] || presDoc.getElementsByTagName('sldIdLst')[0];
    const sldIds = sldIdLst ? Array.from(sldIdLst.children) : [];
    
    const includedIndices = parseRange(fileWrappers[i].slideRange, sldIds.length);
    if (i > 0) {
      totalSlidesToProcess += includedIndices.length;
    }
    
    if (i === 0) {
      metadata.push({
        zip,
        wrapper: fileWrappers[i],
        presDoc,
        sldIds,
        includedIndices
      });
    } else {
      // Discard zip and presDoc to save memory
      metadata.push({
        wrapper: fileWrappers[i],
        includedIndices,
        sldIds: sldIds.map(n => n.getAttribute('r:id')) // we only need the r:id mapping to target
      });
    }
  }

  const baseArc = metadata[0];
  const baseZip = baseArc.zip;
  
  const contentTypesStr = await baseZip.file('[Content_Types].xml').async('string');
  const contentTypes = new ContentTypesBuilder(contentTypesStr);
  
  const basePresRelsStr = await baseZip.file('ppt/_rels/presentation.xml.rels').async('string');
  const basePresRels = new RelationshipBuilder(basePresRelsStr);

  const basePresDoc = baseArc.presDoc;
  const baseSldIdLst = basePresDoc.getElementsByTagName('p:sldIdLst')[0] || basePresDoc.getElementsByTagName('sldIdLst')[0];

  const mediaDedup = new MediaDeduplicator();
  let maxSldId = 255;
  if (baseArc.sldIds.length > 0) {
    baseArc.sldIds.forEach(node => {
      const id = parseInt(node.getAttribute('id'), 10);
      if (!isNaN(id) && id > maxSldId) maxSldId = id;
    });
  }

  for (let i = 1; i < metadata.length; i++) {
    const srcArc = metadata[i];
    onProgress({ file: `Merging ${srcArc.wrapper.file.name}...`, progress: (slidesProcessed / totalSlidesToProcess) * 100 });
    
    let srcZip = null;
    try {
      srcZip = new JSZip();
      await srcZip.loadAsync(srcArc.wrapper.file);

      const srcPresRelsStr = await srcZip.file('ppt/_rels/presentation.xml.rels').async('string');
      const srcPresRelsDoc = new DOMParser().parseFromString(srcPresRelsStr, 'text/xml');
      const srcPresRelsList = Array.from(srcPresRelsDoc.getElementsByTagName('Relationship'));
      
      const filePrefix = `f${i}_`;
      const copiedFilesMap = new Map();

      const copyPart = async (srcPath, destPath, overrideType = null) => {
        if (copiedFilesMap.has(srcPath)) return copiedFilesMap.get(srcPath);
        copiedFilesMap.set(srcPath, destPath);
        
        // Revert to uint8array. JSZip sometimes fails to copy Blobs into new zips properly in older browsers.
        // Memory is already optimized because we only hold one srcZip at a time!
        const fileData = await srcZip.file(srcPath)?.async('uint8array');
        if (!fileData) return null;
        
        baseZip.file(destPath, fileData);
        
        if (overrideType) {
          contentTypes.addOverride('/' + destPath, overrideType);
        }
        return destPath;
      };

      const copyXmlAndRewriteRels = async (xmlPath, destXmlPath, overrideType) => {
        if (copiedFilesMap.has(xmlPath)) return copiedFilesMap.get(xmlPath);
        copiedFilesMap.set(xmlPath, destXmlPath); // Early set prevents circular recursion infinite loops!
        
        let xmlStr = await srcZip.file(xmlPath)?.async('string');
        if (!xmlStr) return null;

        const relsPath = getRelsPath(xmlPath);
        const relsStr = await srcZip.file(relsPath)?.async('string');
        
        if (relsStr) {
          const relsDoc = new DOMParser().parseFromString(relsStr, 'text/xml');
          const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
          
          for (const rel of relNodes) {
            const target = rel.getAttribute('Target');
            const targetMode = rel.getAttribute('TargetMode');
            
            if (targetMode === 'External') continue; 
            
            const absTarget = resolvePath(xmlPath, target);
            
            if (absTarget.startsWith('ppt/media/')) {
              const { newTarget, newName } = mediaDedup.getUniquePath(target, filePrefix);
              const destMedia = `ppt/media/${newName}`;
              await copyPart(absTarget, destMedia);
              rel.setAttribute('Target', newTarget);
              
              // CRITICAL: PPTX requires Content_Types for every file extension!
              // If base file didn't have .png, the merged file images will be broken.
              const ext = newName.includes('.') ? newName.split('.').pop().toLowerCase() : '';
              if (ext) {
                let mime = 'application/octet-stream';
                if (ext === 'png') mime = 'image/png';
                else if (ext === 'jpeg' || ext === 'jpg') mime = 'image/jpeg';
                else if (ext === 'gif') mime = 'image/gif';
                else if (ext === 'emf') mime = 'image/x-emf';
                else if (ext === 'wmf') mime = 'image/x-wmf';
                else if (ext === 'svg') mime = 'image/svg+xml';
                else if (ext === 'mp4') mime = 'video/mp4';
                else if (ext === 'wav') mime = 'audio/wav';
                else if (ext === 'mp3') mime = 'audio/mpeg';
                else if (ext === 'm4a') mime = 'audio/mp4';
                else if (ext === 'avi') mime = 'video/x-msvideo';
                
                contentTypes.addDefault(ext, mime);
              }
            } 
            else if (absTarget.startsWith('ppt/slideLayouts/') || 
                     absTarget.startsWith('ppt/slideMasters/') || 
                     absTarget.startsWith('ppt/theme/') ||
                     absTarget.startsWith('ppt/notesSlides/') ||
                     absTarget.startsWith('ppt/notesMasters/')) {
              
              const filename = absTarget.split('/').pop();
              const newFilename = `${filePrefix}${filename}`;
              const destSubXml = absTarget.replace(filename, newFilename);
              
              let subType = null;
              if (absTarget.includes('slideLayout')) subType = 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml';
              else if (absTarget.includes('slideMaster')) subType = 'application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml';
              else if (absTarget.includes('theme')) subType = 'application/vnd.openxmlformats-officedocument.theme+xml';
              else if (absTarget.includes('notesSlide')) subType = 'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml';
              else if (absTarget.includes('notesMaster')) subType = 'application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml';
              
              await copyXmlAndRewriteRels(absTarget, destSubXml, subType);
              rel.setAttribute('Target', target.replace(filename, newFilename));
            }
          }
          
          const destRelsPath = getRelsPath(destXmlPath);
          baseZip.file(destRelsPath, new XMLSerializer().serializeToString(relsDoc));
        }
        
        baseZip.file(destXmlPath, xmlStr);
        if (overrideType) {
          contentTypes.addOverride('/' + destXmlPath, overrideType);
        }
        return destXmlPath;
      };

      for (const slideIndex of srcArc.includedIndices) {
        const rIdNode = srcArc.sldIds[slideIndex - 1]; 
        if (!rIdNode) continue;
        
        const relNode = srcPresRelsList.find(n => n.getAttribute('Id') === rIdNode);
        if (!relNode) continue;
        
        const srcSlideTarget = relNode.getAttribute('Target'); 
        const srcSlidePath = resolvePath('ppt/presentation.xml', srcSlideTarget);
        
        const newSlideName = `${filePrefix}slide${slideIndex}.xml`;
        const destSlidePath = `ppt/slides/${newSlideName}`;
        
        await copyXmlAndRewriteRels(srcSlidePath, destSlidePath, 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
        
        const newRId = `rIdMerge${uid()}`;
        basePresRels.addRelationship(newRId, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide', `slides/${newSlideName}`);
        
        maxSldId++;
        const newSldIdNode = basePresDoc.createElement('p:sldId');
        newSldIdNode.setAttribute('id', maxSldId.toString());
        newSldIdNode.setAttribute('r:id', newRId);
        baseSldIdLst.appendChild(newSldIdNode);
        
        slidesProcessed++;
        if (totalSlidesToProcess > 0) {
          onProgress({ progress: (slidesProcessed / totalSlidesToProcess) * 100 });
        }
      }
    } catch (err) {
      console.error(`Failed to merge file ${srcArc.wrapper.file.name}:`, err);
    } finally {
      // Clear out JSZip reference heavily to free memory
      srcZip = null;
    }
  }

  baseZip.file('[Content_Types].xml', contentTypes.toString());
  baseZip.file('ppt/_rels/presentation.xml.rels', basePresRels.toString());
  baseZip.file('ppt/presentation.xml', new XMLSerializer().serializeToString(basePresDoc));

  onProgress({ file: 'Finalizing ZIP...', progress: 100 });

  return await baseZip.generateAsync({ type: 'blob' });
}
