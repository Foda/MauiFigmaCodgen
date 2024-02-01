import { parseComponentSet } from "./Handlers/ComponentStyleSetHandler";
import { parseFrameNode } from "./Handlers/FrameHandler";
import { parseRectangleNode } from "./Handlers/RectangleHandler";
import { parseTextNode } from "./Handlers/TextHandler";
import { parseLinearGradientBrush } from "./Types/LinearGradientBrush";
import { parseRadialGradientBrush } from "./Types/RadialGradientBrush";
import { XamlNode } from "./Types/XamlNode";

export function parseNode(nodeObject: SceneNode, resources: Array<XamlResource>) : XamlNode {
  var xamlNode: XamlNode;

  if (nodeObject.type === "FRAME" || nodeObject.type === "COMPONENT" || nodeObject.type === 'INSTANCE') {
    xamlNode = parseFrameNode(nodeObject as FrameNode, resources);
  }
  else if (nodeObject.type === "TEXT") {
    xamlNode = parseTextNode(nodeObject, resources);
  }
  else if (nodeObject.type === "RECTANGLE") {
    xamlNode = parseRectangleNode(nodeObject, resources);
  }
  return xamlNode;
}

export function parseStrokes(nodeObject: GeometryMixin, xamlNode: XamlNode, resources: Array<XamlResource>) {
  if (nodeObject.strokes !== null && nodeObject.strokes.length > 0) {
    const stroke = nodeObject.strokes[0];
    const existingBrush = findExistingSolidBrush(nodeObject.strokes, resources);

    if (existingBrush) {
      xamlNode.addAttribute('Stroke', `{StaticResource ${existingBrush.key}}`);
    } else {
      if (nodeObject.strokes[0].type == 'SOLID') {
        xamlNode.addAttribute('Stroke', `${parseColor(stroke as SolidPaint)}`);
      }
    }

    xamlNode.addAttribute('StrokeThickness', `${String(nodeObject.strokeWeight)}`);
    xamlNode.addAttribute('StrokeMiterLimit', `${String(nodeObject.strokeMiterLimit)}`);
  }

  return xamlNode;
}

export function hasGradient(fills: ReadonlyArray<Paint>): boolean {
  return fills.length > 0 && fills.some(p => p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL');
}

export function parseFill(nodeObject: MinimalFillsMixin, xamlNode: XamlNode, resources: Array<XamlResource>, attribute: string): XamlNode {
  const fills = nodeObject.fills as ReadonlyArray<Paint>;
  const existingBrush = findExistingSolidBrush(fills, resources);

  if (existingBrush) {
    xamlNode.addAttribute(attribute, `{StaticResource ${existingBrush.key}}`);
  } else {
    if (fills && fills.length > 0 && fills[0].type == 'SOLID') {
      xamlNode.addAttribute(attribute, `${parseColor(fills[0])}`);
    }
  }

  return xamlNode;
}

export function parseColor(brush: SolidPaint) {
  return "#" + decimalToHex(brush.opacity) + decimalToHex(brush.color.r) + decimalToHex(brush.color.g) + decimalToHex(brush.color.b);
}

export function decimalToHex(d) {
  return (Math.floor(d * 255)).toString(16).padStart(2, '0');
}

export function findExistingSolidBrush(fills: ReadonlyArray<Paint>, resources: Array<XamlResource>): XamlResource {
  if (fills.length == 1 && fills[0].type === 'SOLID' && fills[0].boundVariables != null) {
    const solidFill = fills[0] as SolidPaint;
    return resources.find((brush) => brush.id == solidFill.boundVariables.color.id);
  }
  return null;
}

export function parseGradientProperty(fills: ReadonlyArray<Paint>): XamlNode {
  if (fills && fills.length > 0) {
    for (var f of fills) {
      const fill = f as GradientPaint;
      if (fill.type == 'GRADIENT_LINEAR') {
        return parseLinearGradientBrush(fill);
      } else if (fill.type == 'GRADIENT_RADIAL') {
        return parseRadialGradientBrush(fill);
      }
    }
  }
}

export function parseColorStop(stop: ColorStop): XamlNode {
  var color = "#" + decimalToHex(stop.color.a) + decimalToHex(stop.color.r) + decimalToHex(stop.color.g) + decimalToHex(stop.color.b);

  var xamlNode = new XamlNode('GradientStop');
  xamlNode.addAttribute('Offset', `${stop.position}`);
  xamlNode.addAttribute('Color', `${color}`);

  return xamlNode;
}