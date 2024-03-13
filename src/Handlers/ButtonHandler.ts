import { XamlNode } from "../Types/XamlNode";
import { findExistingSolidBrush, parseColor, parseFill } from "../Utils";
import { parseLayout, parsePadding } from "./LayoutHandler";
import { parseShadow } from "./ShadowHandler";

export const parseButtonNode = (nodeObject: InstanceNode, resources: Array<XamlResource>): XamlNode => {
    let xamlNode = new XamlNode("Button");

    xamlNode = parseLayout(nodeObject, xamlNode);
    xamlNode = parsePadding(nodeObject as AutoLayoutMixin, xamlNode);
    return xamlNode;
};