import { parseLayout, parsePadding } from "./LayoutHandler";
import { parseFill, parseStrokes, hasGradient, parseNode, parseGradientProperty } from "../Utils";
import { XamlNode } from "../Types/XamlNode";
import { parseShadow } from "./ShadowHandler";

export const parseFrameNode = (nodeObject: FrameNode, resources: Array<XamlResource>): XamlNode => {
  if (nodeObject.inferredAutoLayout != null) {
    var stackNode = buildStackNode(nodeObject, resources);

    // MAUI doesn't support corners or strokes on stack layouts
    var wrapperBorderNode = buildBorderNode(nodeObject, resources);
    wrapperBorderNode.addChild(stackNode);
    return wrapperBorderNode;
  } else {
    var borderNode = buildBorderNode(nodeObject, resources);

    if (nodeObject.children != null) {
      for (var child of nodeObject.children) {
        borderNode.addChild(parseNode(child, resources));
      }
    }

    return borderNode;
  }
};

export const buildStackNode = (nodeObject: FrameNode, resources: Array<XamlResource>): XamlNode => {
  var xamlNode: XamlNode;

  if (nodeObject.inferredAutoLayout.layoutMode === "HORIZONTAL") {
    xamlNode = new XamlNode("HorizontalStackLayout");
  }
  else {
    xamlNode = new XamlNode("VerticalStackLayout");
  }

  xamlNode.addAttribute('Spacing', `${nodeObject.inferredAutoLayout.itemSpacing}`);

  if (nodeObject.children != null) {
    for (var child of nodeObject.children) {
      var childXaml = parseNode(child, resources);
      if (nodeObject.inferredAutoLayout.counterAxisAlignItems === "CENTER") {
        if (nodeObject.inferredAutoLayout.layoutMode === "HORIZONTAL") {
          childXaml.addAttribute('VerticalOptions', 'Center');
        } else {
          childXaml.addAttribute('HorizontalOptions', 'Center');
        }
      }
      xamlNode.addChild(childXaml);
    }
  }

  return xamlNode;
};

export const buildBorderNode = (nodeObject: FrameNode, resources: Array<XamlResource>): XamlNode => {
  var xamlNode = new XamlNode("Border");

  xamlNode.addAttribute('StrokeShape',
    `RoundRectangle ${nodeObject.topLeftRadius} ${nodeObject.topRightRadius} ${nodeObject.bottomRightRadius} ${nodeObject.bottomLeftRadius}`);

  xamlNode = parseFill(nodeObject, xamlNode, resources, 'Background');
  xamlNode = parseStrokes(nodeObject, xamlNode, resources);

  if (nodeObject.opacity != 1) {
    xamlNode.addAttribute('Opacity', `${nodeObject.opacity}`);
  }

  xamlNode = parseLayout(nodeObject, xamlNode);
  xamlNode = parsePadding(nodeObject as AutoLayoutMixin, xamlNode);

  const fills = nodeObject.fills as ReadonlyArray<Paint>;
  if (hasGradient(fills)) {
    xamlNode.addChildPropertyElement('Background', parseGradientProperty(fills));
  }
  
  const strokes = nodeObject.strokes as ReadonlyArray<Paint>;
  if (hasGradient(strokes)) {
    xamlNode.addChildPropertyElement('Stroke', parseGradientProperty(strokes));
  }

  xamlNode = parseShadow(nodeObject as BlendMixin, xamlNode);

  return xamlNode;
};