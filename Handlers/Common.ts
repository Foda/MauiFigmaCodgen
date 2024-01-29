const XamlCloseBrace = '/>';

export const addProperty = (input: string, property: string, value: string): string => {
    return input + `\n\t${property}="${value}"`;
};