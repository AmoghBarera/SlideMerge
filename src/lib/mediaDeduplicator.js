export class MediaDeduplicator {
  constructor() {
    this.fileMap = new Map(); // originalPath -> newPath
    this.counter = 1;
  }

  getUniquePath(originalTarget, filePrefix) {
    const key = filePrefix + originalTarget;
    if (this.fileMap.has(key)) {
      return this.fileMap.get(key);
    }

    const parts = originalTarget.split('/');
    const filename = parts.pop();
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
    
    // Generate unique name
    const newName = `${filePrefix}media_${this.counter++}${ext}`;
    parts.push(newName);
    
    const newTarget = parts.join('/');
    const result = { newTarget, newName };
    this.fileMap.set(key, result);
    
    return result;
  }
}
