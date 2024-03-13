import { XamlNode } from "../Types/XamlNode";

export const parseLayout = (nodeObject: SceneNode, xamlNode: XamlNode): XamlNode => {
    var respectWidth = true;
    var respectHeight = true;

    const layoutNode = nodeObject as LayoutMixin;
    if (layoutNode != null) {
        if (layoutNode.layoutSizingHorizontal != 'FIXED') {
            respectWidth = false;
            xamlNode.addAttribute('HorizontalOptions', 'Fill');
        }

        if (layoutNode.layoutSizingVertical != 'FIXED') {
            respectHeight = false;
            xamlNode.addAttribute('VerticalOptions', 'Fill');
        }
    }

    if (respectWidth) {
        xamlNode.addAttribute('WidthRequest', `${nodeObject.width}`);
    }

    if (respectHeight) {
        xamlNode.addAttribute('HeightRequest', `${nodeObject.height}`);
    }

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

    return xamlNode;
};

export const parsePadding = (nodeObject: AutoLayoutMixin, xamlNode: XamlNode): XamlNode => {
    var padding = paddingToString(nodeObject);
    xamlNode.addAttribute('Padding', padding);
    return xamlNode;
};

export const paddingToString = (nodeObject: AutoLayoutMixin): string => {
    if (nodeObject.paddingBottom == undefined &&
        nodeObject.paddingLeft == undefined &&
        nodeObject.paddingRight == undefined &&
        nodeObject.paddingTop == undefined) {
        return "0";
    } else {
        const padding =
            `${nodeObject.paddingLeft == undefined ? 0 : nodeObject.paddingLeft},` +
            `${nodeObject.paddingTop == undefined ? 0 : nodeObject.paddingTop},` +
            `${nodeObject.paddingRight == undefined ? 0 : nodeObject.paddingRight},` +
            `${nodeObject.paddingBottom == undefined ? 0 : nodeObject.paddingBottom}`;

        return padding;
    }
};