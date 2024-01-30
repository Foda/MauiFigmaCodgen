import { extractLinearGradientParamsFromTransform } from "@figma-plugin/helpers";
import { decimalToHex } from "../Utils";
import { XamlNode } from "./XamlNode";

export const parseLinearGradientBrush = (paint: GradientPaint): XamlNode => {
  var xamlNode = new XamlNode('LinearGradientBrush');
  for (var s of paint.gradientStops) {
    xamlNode.addChild(parseColorStop(s));
  }

  // Use 1,1 for a normalized value
  var startEnd = extractLinearGradientParamsFromTransform(1, 1, paint.gradientTransform);
  xamlNode.addAttribute('StartPoint', `${startEnd.start[0]}, ${startEnd.start[1]}`);
  xamlNode.addAttribute('EndPoint', `${startEnd.end[0]}, ${startEnd.end[1]}`);

  return xamlNode;
};

export function parseColorStop(stop: ColorStop): XamlNode {
  var color = "#" + decimalToHex(stop.color.a) + decimalToHex(stop.color.r) + decimalToHex(stop.color.g) + decimalToHex(stop.color.b);

  var xamlNode = new XamlNode('GradientStop');
  xamlNode.addAttribute('Offset', `${stop.position}`);
  xamlNode.addAttribute('Color', `${color}`);

  return xamlNode;
}

export function parseGradientProperty(fills: ReadonlyArray<Paint>): XamlNode {
  if (fills && fills.length > 0 && fills[0].type == 'GRADIENT_LINEAR') {
    const fill = fills[0] as GradientPaint;
    return parseLinearGradientBrush(fill);
  }
}