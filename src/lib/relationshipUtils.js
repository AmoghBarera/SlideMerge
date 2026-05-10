export class RelationshipBuilder {
  constructor(xmlString) {
    if (xmlString) {
      const parser = new DOMParser();
      this.doc = parser.parseFromString(xmlString, "text/xml");
    } else {
      const parser = new DOMParser();
      this.doc = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>', "text/xml");
    }
  }

  addRelationship(id, type, target, targetMode = null) {
    const root = this.doc.documentElement;
    const rel = this.doc.createElement('Relationship');
    rel.setAttribute('Id', id);
    rel.setAttribute('Type', type);
    rel.setAttribute('Target', target);
    if (targetMode) {
      rel.setAttribute('TargetMode', targetMode);
    }
    root.appendChild(rel);
  }

  getRelationships() {
    const root = this.doc.documentElement;
    return Array.from(root.getElementsByTagName('Relationship')).map(el => ({
      id: el.getAttribute('Id'),
      type: el.getAttribute('Type'),
      target: el.getAttribute('Target'),
      targetMode: el.getAttribute('TargetMode')
    }));
  }

  toString() {
    return new XMLSerializer().serializeToString(this.doc);
  }
}
