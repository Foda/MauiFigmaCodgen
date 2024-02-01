import { parseLayout } from "./LayoutHandler";
import { parseFill, parseStrokes, hasGradient, parseGradientProperty } from "../Utils";
import { XamlNode } from "../Types/XamlNode";
import { parseShadow } from "./ShadowHandler";

export const parseRectangleNode = (nodeObject: RectangleNode, resources: Array<XamlResource>): XamlNode => {
  let xamlNode = new XamlNode("Rectangle");

  xamlNode.addAttribute('RadiusX', `${nodeObject.topLeftRadius}`);
  xamlNode.addAttribute('RadiusY', `${nodeObject.bottomRightRadius}`);

  xamlNode = parseFill(nodeObject, xamlNode, resources, 'Fill');
  xamlNode = parseStrokes(nodeObject, xamlNode, resources);

  if (nodeObject.opacity != 1) {
    xamlNode.addAttribute('Opacity', `${nodeObject.opacity}`);
  }

  xamlNode = parseLayout(nodeObject, xamlNode);

  const fills = nodeObject.fills as ReadonlyArray<Paint>;
  if (hasGradient(fills)) {
    xamlNode.addChildPropertyElement('Fill', parseGradientProperty(fills));
  }
  
  const strokes = nodeObject.strokes as ReadonlyArray<Paint>;
  if (hasGradient(strokes)) {
    xamlNode.addChildPropertyElement('Stroke', parseGradientProperty(strokes));
  }

  xamlNode = parseShadow(nodeObject as BlendMixin, xamlNode);

  return xamlNode;
};