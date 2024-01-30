import { XamlNode } from "../Types/XamlNode";
import { parseFill } from "../Utils";

export const parseTextNode = (nodeObject: TextNode, resources: Array<XamlResource>): XamlNode => {
    let xamlNode = new XamlNode("Label");
    xamlNode.addAttribute('FontFamily', `${(nodeObject.fontName as FontName).family}`);
    xamlNode.addAttribute('FontSize', `${String(nodeObject.fontSize)}`);

    xamlNode = parseFill(nodeObject, xamlNode, resources, 'TextColor');
    
    let horzAlignment = '';
    switch (nodeObject.textAlignHorizontal) {
        case "LEFT":
        case "JUSTIFIED":
            horzAlignment = `Start`;
            break;
        case "CENTER":
            horzAlignment = `Center`;
            break;
        case "RIGHT":
            horzAlignment = `End`;
            break;
    }
    xamlNode.addAttribute('HorizontalTextAlignment', horzAlignment);

    let vertAlignment = '';
    switch (nodeObject.textAlignVertical) {
        case "TOP":
            vertAlignment = `Start`;
            break;
        case "CENTER":
            vertAlignment = `Center`;
            break;
        case "BOTTOM":
            vertAlignment = `End`;
            break;
    }
    xamlNode.addAttribute('VerticalTextAlignment', vertAlignment);

    if (nodeObject.characters !== null) {
        xamlNode.addAttribute('Text', `${nodeObject.characters}`);
    }

    return xamlNode;
};