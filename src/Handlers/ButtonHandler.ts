import { XamlNode } from "../Types/XamlNode";
import { findExistingSolidBrush, parseColor, parseFill } from "../Utils";
import { parseLayout } from "./LayoutHandler";
import { parseShadow } from "./ShadowHandler";

export const parseButtonNode = (nodeObject: ComponentNode, resources: Array<XamlResource>): XamlNode => {
    let xamlNode = new XamlNode("Button");

    xamlNode = parseLayout(nodeObject, xamlNode);
    xamlNode = parseFill(nodeObject, xamlNode, resources, 'Background');
    
    if (nodeObject.strokes != null) {
        const stroke = nodeObject.strokes[0];
        const existingBrush = findExistingSolidBrush(nodeObject.strokes, resources);
        
        if (existingBrush) {
            xamlNode.addAttribute('BorderColor', `{StaticResource ${existingBrush.key}}`);
        } else if (nodeObject.strokes[0].type == 'SOLID') {
            xamlNode.addAttribute('BorderColor', `${parseColor(stroke as SolidPaint)}`);
        }

        xamlNode.addAttribute('BorderWidth', `${String(nodeObject.strokeWeight)}`);
    }

    if (nodeObject.opacity != 1) {
        xamlNode.addAttribute('Opacity', `${nodeObject.opacity}`);
    }

    if (nodeObject.topLeftRadius != 0 || nodeObject.topRightRadius != 0 || nodeObject.bottomRightRadius != 0 || nodeObject.bottomLeftRadius != 0) {
        xamlNode.addAttribute('CornerRadius', `${nodeObject.topLeftRadius}, ${nodeObject.topRightRadius}, ${nodeObject.bottomRightRadius}, ${nodeObject.bottomLeftRadius}`);
    }
    
    xamlNode = parseShadow(nodeObject as BlendMixin, xamlNode);

    return xamlNode;
};