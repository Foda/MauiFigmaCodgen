interface XamlResource {
  readonly id: string;
  readonly key: string;
  toXAML() : string;
}