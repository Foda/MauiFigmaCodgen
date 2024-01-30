import { XamlNode } from "../Types/XamlNode";

export const parseLayout = (nodeObject: SceneNode, xamlNode: XamlNode): XamlNode => {
    xamlNode.addAttribute('WidthRequest', `${nodeObject.width}`);
    xamlNode.addAttribute('HeightRequest', `${nodeObject.height}`);

    if (nodeObject.minWidth !== null) {
        xamlNode.addAttribute('MinimumWidthRequest', `${nodeObject.minWidth}`);
    }
    if (nodeObject.minHeight !== null) {
        xamlNode.addAttribute('MinimumHeightRequest', `${nodeObject.minHeight}`);
    }
    if (nodeObject.maxWidth !== null) {
        xamlNode.addAttribute('MaximumWidthRequest', `${nodeObject.maxWidth}`);
    }
    if (nodeObject.maxHeight !== null) {
        xamlNode.addAttribute('MaximumHeightRequest', `${nodeObject.maxHeight}`);
    }

    xamlNode = parsePadding(nodeObject as AutoLayoutMixin, xamlNode);

    return xamlNode;
};

export const parsePadding = (nodeObject: AutoLayoutMixin, xamlNode: XamlNode): XamlNode => {
    if (nodeObject.paddingBottom == undefined &&
        nodeObject.paddingLeft == undefined &&
        nodeObject.paddingRight == undefined &&
        nodeObject.paddingTop == undefined) {
        return xamlNode;
    } else {
        var padding = 
            `${nodeObject.paddingLeft == undefined ? 0 : nodeObject.paddingLeft},` +
            `${nodeObject.paddingTop == undefined ? 0 : nodeObject.paddingTop},` +
            `${nodeObject.paddingRight == undefined ? 0 : nodeObject.paddingRight},` +
            `${nodeObject.paddingBottom == undefined ? 0 : nodeObject.paddingBottom}`;

        xamlNode.addAttribute('Padding', padding);
        return xamlNode;
    }
};