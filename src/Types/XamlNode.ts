import indentString from 'indent-string';

export class XamlNode {
  readonly typeName: string;
  attributes: Array<[attribute: string, value: string]>;
  childElements: Array<XamlNode>;
  childPropertyElements: Array<[string, XamlNode]>;

  constructor(typeName: string) {
    this.typeName = typeName;
    this.attributes = new Array<[attribute: string, value: string]>;
    this.childElements = new Array<XamlNode>;
    this.childPropertyElements = new Array<[string, XamlNode]>;
  }

  public addAttribute(attribute: string, value: string): void {
    this.attributes.push([attribute, value]);
  }

  public addChild(element: XamlNode): void {
    this.childElements.push(element);
  }

  public addChildPropertyElement(attribute: string, element: XamlNode): void {
    this.childPropertyElements.push([attribute, element]);
  }

  buildChildPropertyElements(indent: number=0): string {
    var result = '';
    for (var child of this.childPropertyElements) {
      result += indentString(`\n<${this.typeName}.${child[0]}>\n`, indent);
      result += indentString(`${child[1].buildString(indent + 1)}\n`, indent);
      result += indentString(`</${this.typeName}.${child[0]}>`, indent);
    }
    return result;
  }

  public buildString(indent: number=0): string {
    var result = indentString(`<${this.typeName}`, indent);
    for (var attribute of this.attributes) {
      result += indentString(`\n${attribute[0]}="${attribute[1]}"`, indent + 2);
    }

    if (this.childElements.length == 0 && this.childPropertyElements.length == 0) {
      result += `/>`
    } else {
      result += `>`
    
      if (this.childPropertyElements.length > 0) {
        result += this.buildChildPropertyElements(indent + 2);
      }

      if (this.childElements.length > 0) {
        for (var child of this.childElements) {
          result += indentString(`\n${child.buildString()}`, indent + 2);
        }
      }

      result += indentString(`\n</${this.typeName}>`, indent);
    }
    return result;
  }
}