import { extractRadialOrDiamondGradientParams } from "@figma-plugin/helpers";
import { parseColorStop } from "../Utils";
import { XamlNode } from "./XamlNode";

export const parseRadialGradientBrush = (paint: GradientPaint): XamlNode => {
  var xamlNode = new XamlNode('RadialGradientBrush');
  for (var s of paint.gradientStops) {
    xamlNode.addChild(parseColorStop(s));
  }

  // Use 1,1 for a normalized value
  var gradientProps = extractRadialOrDiamondGradientParams(1, 1, paint.gradientTransform);
  xamlNode.addAttribute('Center', `${gradientProps.center[0]}, ${gradientProps.center[1]}`);
  xamlNode.addAttribute('Radius', `${gradientProps.radius[0]}`);

  return xamlNode;
};