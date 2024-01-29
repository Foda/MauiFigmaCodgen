import { addProperty } from "./Common";
import { parseLayout } from "./LayoutHandler";

export const parseFrameNode = (nodeObject: FrameNode, resources: Array<XamlResource>): string => {
    let result = `<Border`;

    result = addProperty(
        result,
        'StrokeShape',
        `RoundRectangle ${nodeObject.topLeftRadius} ${nodeObject.topRightRadius} ${nodeObject.bottomRightRadius} ${nodeObject.bottomLeftRadius}`
    );

    result += parseFill(nodeObject, resources);
    result += parseStrokes(nodeObject, resources);
    if (nodeObject.opacity != 1) {
        result = addProperty(result, 'Opacity', `${nodeObject.opacity}`);
    }

    result += parseLayout(nodeObject);

    result += ` />`;
    return result;
};