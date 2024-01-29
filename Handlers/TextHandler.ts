export const parseTextNode = (nodeObject: TextNode, resources: Array<XamlResource>): string => {
    let result = `<Label`;
    result += `\n\tFontFamily="${(nodeObject.fontName as FontName).family}"`;
    result += `\n\tFontSize="${String(nodeObject.fontSize)}"`;

    switch (nodeObject.textAlignHorizontal) {
        case "LEFT":
            result += `\n\tHorizontalTextAlignment="Start"`;
            break;
        case "CENTER":
            result += `\n\tHorizontalTextAlignment="Center"`;
            break;
        case "RIGHT":
            result += `\n\tHorizontalTextAlignment="End"`;
            break;
        case "JUSTIFIED":
            result += `\n\tHorizontalTextAlignment="Start"`;
            break;
    }

    switch (nodeObject.textAlignVertical) {
        case "TOP":
            result += `\n\tVerticalTextAlignment="Start"`;
            break;
        case "CENTER":
            result += `\n\tVerticalTextAlignment="Center"`;
            break;
        case "BOTTOM":
            result += `\n\tVerticalTextAlignment="End"`;
            break;
    }

    if (nodeObject.characters !== null) {
        result += `\n\tText="${nodeObject.characters}"`;
    }

    result += ` />`;
    return result;
};