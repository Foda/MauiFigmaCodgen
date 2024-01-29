import { addProperty } from "./Common";

export const parseLayout = (nodeObject: SceneNode): string => {
    let result = "";

    result = addProperty(result, 'WidthRequest', `${nodeObject.width}`);
    result = addProperty(result, 'HeightRequest', `${nodeObject.height}`);

    if (nodeObject.minWidth !== null) {
        result = addProperty(result, 'MinimumWidthRequest', `${nodeObject.minWidth}`);
    }
    if (nodeObject.minHeight !== null) {
        result = addProperty(result, 'MinimumHeightRequest', `${nodeObject.minHeight}`);
    }
    if (nodeObject.maxWidth !== null) {
        result = addProperty(result, 'MaximumWidthRequest', `${nodeObject.maxWidth}`);
    }
    if (nodeObject.maxHeight !== null) {
        result = addProperty(result, 'MaximumHeightRequest', `${nodeObject.maxHeight}`);
    }

    result += parsePadding(nodeObject as AutoLayoutMixin);

    return result;
};

export const parsePadding = (nodeObject: AutoLayoutMixin): string => {
    if (nodeObject.paddingBottom == undefined &&
        nodeObject.paddingLeft == undefined &&
        nodeObject.paddingRight == undefined &&
        nodeObject.paddingTop == undefined) {
        return "";
    } else {
        return `\n\tPadding="${nodeObject.paddingLeft == undefined ? 0 :
            nodeObject.paddingLeft},` +
            `${nodeObject.paddingTop == undefined ? 0 : nodeObject.paddingTop},` +
            `${nodeObject.paddingRight == undefined ? 0 : nodeObject.paddingRight},` +
            `${nodeObject.paddingBottom == undefined ? 0 : nodeObject.paddingBottom}"`;
    }
};