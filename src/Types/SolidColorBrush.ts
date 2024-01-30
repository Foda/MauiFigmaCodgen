export class XamlSolidColorBrush implements XamlResource {
  readonly id: string;
  readonly key: string;
  readonly value: string;

  constructor(id: string, key: string, value: string) {
    this.id = id;
    this.key = key;
    this.value = value;
  }

  public toXAML() : string {
    return `<SolidColorBrush x:Name="${this.key}" Color="${this.value}" />\n`;
  }
}