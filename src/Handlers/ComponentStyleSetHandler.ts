import { paddingToString } from "./LayoutHandler";
import { parseColor } from "../Utils";
import { XamlNode } from "../Types/XamlNode";
import { XamlLinearGradientBrush } from "../Types/LinearGradientBrush";

export const parseComponentSet = (nodeObject: ComponentSetNode, resources: Array<XamlResource>): Array<XamlNode> => {
  if (!validComponentTypes.includes(nodeObject.name)) {
    return null;
  }

  var styles = new Array<XamlNode>;

  for (var styleType of nodeObject.variantGroupProperties.Style.values) {
    var xamlStyleNode = new XamlNode("Style");
    xamlStyleNode.addAttribute("x:Key", styleType);
    xamlStyleNode.addAttribute("TargetType", nodeObject.name);

    // Get a list of all the components for the current style
    var styleComponentNodes = nodeObject.children.filter((n, idx, arr) => {
      const componentNode = n as ComponentNode;
      return componentNode != null && componentNode.variantProperties.Style === styleType;
    });

    xamlStyleNode = componentStyleParsers[nodeObject.name](styleComponentNodes, resources, xamlStyleNode);

    if (xamlStyleNode != null) {
      styles.push(xamlStyleNode);
    }
  }

  return styles;
};

export const parseButtonStyleSet = (componentNodes: Array<ComponentNode>, resources: Array<XamlResource>, xamlStyleNode: XamlNode): XamlNode => {
  // Normal | Disabled | Hover | Pressed
  const defaultStyleNode = componentNodes.find(n => n.variantProperties.State === "Normal");
  if (defaultStyleNode == null) {
    return null;
  }

  for (const mapper of buttonPropertyMappers) {
    xamlStyleNode.addChild(
      buildBasicStyleSetter(
        mapper.property, mapper.mapFunc(defaultStyleNode, resources)));
  }

  // Build child text style
  const textStyleNode = defaultStyleNode.children.find(n => n.name === "Label") as TextNode;
  if (textStyleNode != null) {
    xamlStyleNode.addChild(buildBasicStyleSetter("FontFamily", `${(textStyleNode.fontName as FontName).family}`));
    xamlStyleNode.addChild(buildBasicStyleSetter("FontSize", `${String(textStyleNode.fontSize)}`));
    xamlStyleNode.addChild(buildBasicStyleSetter("TextColor", `${convertFillToString(textStyleNode, resources)}`));
  }

  var visualStateManager = buildVisualStateManager(componentNodes, buttonPropertyMappers, resources);
  xamlStyleNode.addChild(visualStateManager);
  
  return xamlStyleNode;
};

export const buildBasicStyleSetter = (property: string, value: string): XamlNode => {
  var setterNode = new XamlNode("Setter");
  setterNode.addAttribute("Property", property);
  setterNode.addAttribute("Value", value);
  return setterNode;
};

// Pass in a list of nodes of the same style
export const buildVisualStateManager = (componentNodes: Array<ComponentNode>, propertyMapper: PropertyMap[], resources: Array<XamlResource>): XamlNode => {
  var rootNode = new XamlNode("Setter");
  rootNode.addAttribute("Property", "VisualStateManager.VisualStateGroups");

  var groupNode = new XamlNode("VisualStateGroupList");
  rootNode.addChild(groupNode);

  var stateGroupNode = new XamlNode("VisualStateGroup");
  stateGroupNode.addAttribute("x:Name", "CommonStates");
  groupNode.addChild(stateGroupNode);

  for (var componentStyle of componentNodes) {
    var visualStateSetters = new Array<XamlNode>;

    for (const mapper of propertyMapper) {
      visualStateSetters.push(
        buildBasicStyleSetter(
          mapper.property, mapper.mapFunc(componentStyle, resources)));
    }

    stateGroupNode.addChild(
      buildVisualState(componentStyle.variantProperties.State, visualStateSetters));
  }

  return rootNode;
};

export const buildVisualState = (state: string, setters: Array<XamlNode>): XamlNode => {
  var stateNode = new XamlNode("VisualState");
  stateNode.addAttribute("x:Name", state);

  var setterParentNode = new XamlNode("VisualState.Setters");
  for (var s of setters) {
    setterParentNode.addChild(s);
  }

  stateNode.addChild(setterParentNode);
  return stateNode;
};

// Returns a node such as: <Setter Property="Background" Value="Red" />
export const mapStyleProperty = (node: ComponentNode, property: string, mapFunc: (node: ComponentNode) => string): XamlNode => {
  var xamlNode = new XamlNode("Setter");
  xamlNode.addAttribute("Property", property);
  xamlNode.addAttribute("Value", mapFunc(node));
  return xamlNode;
};

export const convertFillToString = (nodeObject: MinimalFillsMixin, resources: Array<XamlResource>): string => {
  const fills = nodeObject.fills as ReadonlyArray<Paint>;
  if (fills && fills.length > 0 && fills[0].type == 'SOLID') {
    return `${parseColor(fills[0])}`
  }
  return '';
};

export const convertStrokeToString = (nodeObject: ComponentNode, resources: Array<XamlResource>): string => {
  const strokes = (nodeObject as MinimalStrokesMixin).strokes as ReadonlyArray<Paint>;
  if (strokes && strokes.length > 0) {
    if (strokes[0].type === 'SOLID') {
      return `${parseColor(strokes[0])}`
    } else if (strokes[0].type === 'GRADIENT_LINEAR') {
      const brushName = `${nodeObject.variantProperties.Style}${nodeObject.variantProperties.State}StrokeBrush`;
      const existingBrush = resources.find((brush) => brush.key == brushName);
      if (existingBrush == null) {
        const gradientBrush = new XamlLinearGradientBrush('-1', brushName, strokes[0]);
        resources.push(gradientBrush);
      }
      return `{StaticResource ${brushName}}`;
    }
  }
  return '';
};

export const convertStrokeWidthToString = (nodeObject: MinimalStrokesMixin): string => {
  return String(nodeObject.strokeWeight);
};

// -----------------------------------------------
// TODO: a better way to define this mapping stuff
// -----------------------------------------------
export interface PropertyMap {
  property: string;
  mapFunc: (node: ComponentNode, resources: Array<XamlResource>) => string;
};

const buttonPropertyMappers: PropertyMap[] = [
  { property: 'BackgroundColor', mapFunc: (n: ComponentNode, resources: Array<XamlResource>) => convertFillToString(n, resources)},
  { property: 'BorderColor', mapFunc: (n: ComponentNode, resources: Array<XamlResource>) => convertStrokeToString(n, resources)},
  { property: 'BorderWidth', mapFunc: (n: ComponentNode, resources: Array<XamlResource>) => convertStrokeWidthToString(n)},
  { property: 'CornerRadius', mapFunc: (n: ComponentNode, resources: Array<XamlResource>) => `${n.topLeftRadius}`},
  { property: 'Padding', mapFunc: (n: ComponentNode, resources: Array<XamlResource>) => paddingToString(n)},
];

const validComponentTypes = ["Button", "Border"];
const componentStyleParsers = {
  'Button': parseButtonStyleSet
};
