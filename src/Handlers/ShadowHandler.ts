import { XamlNode } from "../Types/XamlNode";
import { decimalToHex } from "../Utils";

export const parseShadow = (nodeObject: BlendMixin, xamlNode: XamlNode): XamlNode => {
    var shadowNode = new XamlNode('Shadow');

    for (var effect of nodeObject.effects) {
        if (effect.type === 'DROP_SHADOW') {
            var shadow = effect as DropShadowEffect;
            var color = "#" + decimalToHex(shadow.color.r) + decimalToHex(shadow.color.g) + decimalToHex(shadow.color.b);
            shadowNode.addAttribute('Brush', color);
            shadowNode.addAttribute('Opacity', `${shadow.color.a}`);
            shadowNode.addAttribute('Offset', `${shadow.offset.x},${shadow.offset.y}`);
            shadowNode.addAttribute('Radius', `${shadow.radius}`);

            xamlNode.addChildPropertyElement('Shadow', shadowNode);
        }
    }
    return xamlNode;
};