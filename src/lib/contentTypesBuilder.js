export class ContentTypesBuilder {
  constructor(xmlString) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(xmlString, "text/xml");
  }

  addOverride(partName, contentType) {
    const root = this.doc.documentElement;
    // Check if exists
    const existing = Array.from(root.getElementsByTagName('Override')).find(
      el => el.getAttribute('PartName') === partName
    );
    if (!existing) {
      const override = this.doc.createElement('Override');
      override.setAttribute('PartName', partName);
      override.setAttribute('ContentType', contentType);
      root.appendChild(override);
    }
  }

  addDefault(extension, contentType) {
    const root = this.doc.documentElement;
    const existing = Array.from(root.getElementsByTagName('Default')).find(
      el => el.getAttribute('Extension') === extension
    );
    if (!existing) {
      const def = this.doc.createElement('Default');
      def.setAttribute('Extension', extension);
      def.setAttribute('ContentType', contentType);
      root.appendChild(def);
    }
  }

  toString() {
    return new XMLSerializer().serializeToString(this.doc);
  }
}
