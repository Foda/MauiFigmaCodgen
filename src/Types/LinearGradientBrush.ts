import { extractLinearGradientParamsFromTransform } from "@figma-plugin/helpers";
import { parseColorStop } from "../Utils";
import { XamlNode } from "./XamlNode";

export class XamlLinearGradientBrush implements XamlResource {
  readonly id: string;
  readonly key: string;
  readonly xamlNode: XamlNode;

  constructor(id: string, key: string, paint: GradientPaint) {
    this.id = id;
    this.key = key;

    this.xamlNode = parseLinearGradientBrush(paint);
    this.xamlNode.addAttribute("x:Key", this.key);
  }

  public toXAML() : string {
    return `${this.xamlNode.buildString()}\n`;
  }
}

export const parseLinearGradientBrush = (paint: GradientPaint): XamlNode => {
  var xamlNode = new XamlNode('LinearGradientBrush');
  for (var s of paint.gradientStops) {
    xamlNode.addChild(parseColorStop(s));
  }

  // Use 1,1 for a normalized value
  var startEnd = extractLinearGradientParamsFromTransform(1, 1, paint.gradientTransform);
  xamlNode.addAttribute('StartPoint', `${startEnd.start[0].toFixed(3)}, ${startEnd.start[1].toFixed(3)}`);
  xamlNode.addAttribute('EndPoint', `${startEnd.end[0].toFixed(3)}, ${startEnd.end[1].toFixed(3)}`);

  return xamlNode;
};