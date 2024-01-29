import { parseLayout, parsePadding } from "./Handlers/LayoutHandler";
import { parseTextNode } from "./Handlers/TextHandler";
import { parseFrameNode } from "./Handlers/FrameHandler";

interface XamlResource {
  readonly id: string;
  readonly key: string;
  readonly value: string;
  toXAML() : string;
}

class XamlSolidColorBrush implements XamlResource {
  readonly id: string;
  readonly key: string;
  readonly value: string;

  constructor(id: string, key: string, value: string) {
    this.id = id;
    this.key = key;
    this.value = value;
  }

  public toXAML() : string {
    return `<SolidColorBrush x:Name="${this.key}" Color="${this.value}" />\n`;
  }
}

figma.codegen.on("generate", (eventData) => {
  const node: SceneNode = eventData.node;
  const xamlResources: Array<XamlResource> = parseBrushes(node as MinimalFillsMixin);
  let resourceDict = '';

  xamlResources.forEach((resource) => {
    resourceDict += resource.toXAML();
  });
  
  let result: CodegenResult[] =
  [
    {
      title: `XAML`,
      code: toMaui(node, xamlResources),
      language: "HTML",
    },
    {
      title: `Resources`,
      code: resourceDict,
      language: "HTML",
    }
  ];
  return result;
});

function toMaui(nodeObject: SceneNode, resources: Array<XamlResource>) {
  console.log(nodeObject);
  if (nodeObject.type === "FRAME" || nodeObject.type === "COMPONENT" || nodeObject.type === 'INSTANCE') {
    return parseFrameNode(nodeObject as FrameNode, resources);
  }
  else if (nodeObject.type === "TEXT") {
    return parseTextNode(nodeObject, resources);
  }
  else if (nodeObject.type === "RECTANGLE") {
    return handleRectangleNode(nodeObject, resources);
  }
  //else if (nodeObject. != null && nodeObject.children.length > 0 && nodeObject.children[0].type == "VECTOR") {
  //  return handleVectorNode(nodeObject.children[0]);
  //}
  return '';
}

function parseBrushes(nodeObject: MinimalFillsMixin | MinimalStrokesMixin) : Array<XamlSolidColorBrush> {
  let resourceDict = new Array<XamlSolidColorBrush>();
  if (nodeObject == null) {
    return resourceDict;
  }

  const asFills = nodeObject as MinimalFillsMixin;
  const asStrokes = nodeObject as MinimalStrokesMixin;

  // We only support solid colors for now
  if (asFills != null) {
      (asFills.fills as ReadonlyArray<Paint>).forEach((fill) => {
        const asXaml = paintToXamlResource(fill);
        if (asXaml) {
          resourceDict.push(asXaml);
        }
      });
  }

  if (asStrokes != null) {
    (asStrokes.strokes as ReadonlyArray<Paint>).forEach((fill) => {
      const asXaml = paintToXamlResource(fill);
      if (asXaml) {
        resourceDict.push(asXaml);
      }
    });
  }

  return resourceDict;
}

function paintToXamlResource(fill: Paint) : XamlResource {
  if (fill.type === 'SOLID') {
    const solidFill = fill as SolidPaint;
    if (solidFill.boundVariables && solidFill.boundVariables.color) {
      const resolvedVar = figma.variables.getVariableById(solidFill.boundVariables.color.id);
      const brushName = resolvedVar.name.replaceAll('/', '').replaceAll(' ', '');
      console.log(resolvedVar);
      return new XamlSolidColorBrush(solidFill.boundVariables.color.id, brushName, parseColor(solidFill));
    }
  }

  return null;
}

function handleRectangleNode(nodeObject: RectangleNode, resources: Array<XamlResource>) {
  let result = `<Rectangle `;

  // Border specific properties
  result += parseFill(nodeObject, resources, 'Fill');
  result += parseStrokes(nodeObject, resources);
  if (nodeObject.opacity != 1) {
    result += `\n\tOpacity="${nodeObject.opacity}"`;
  }

  result += parseLayout(nodeObject);

  result += ` />`;
  return result;
}

// function handleVectorNode(nodeObject: VectorNode) {
//   let result = `<Path `;
// 
//   if (nodeObject.opacity != 1) {
//     result += ` Opacity="${nodeObject.opacity}"`;
//   }
// 
//   // Use parent sizing
//   result += parseLayout(nodeObject.parent);
// 
//   result += `Data="${nodeObject.vectorPaths[0].data}"`;
//   result += parseStrokes(nodeObject);
// 
//   result += ` />`;
//   return result;
// };

function parseStrokes(nodeObject: GeometryMixin, resources: Array<XamlResource>) {
  if (nodeObject.strokes !== null && nodeObject.strokes.length > 0) {
    const stroke = nodeObject.strokes[0];
    let result = "";

    const existingBrush = findExistingSolidBrush(nodeObject.strokes, resources);
    if (existingBrush) {
      result += `\n\tStroke="{StaticResource ${existingBrush.key}}"`;
    } else {
      if (nodeObject.strokes[0].type == 'SOLID') {
        result += `\n\tStroke="${parseColor(stroke as SolidPaint)}"`;
      }
    }

    result += `\n\tStrokeThickness="${String(nodeObject.strokeWeight)}"`;
    result += `\n\tStrokeMiterLimit="${String(nodeObject.strokeMiterLimit)}"`;
    return result;
  }

  return ' StrokeThickness="0"';
}

function parseFill(nodeObject: MinimalFillsMixin, resources: Array<XamlResource>, xamlNodeType = 'Background') : string {
  const fills = nodeObject.fills as ReadonlyArray<Paint>;
  const existingBrush = findExistingSolidBrush(fills, resources);
  if (existingBrush) {
    return `\n\tBackground="{StaticResource ${existingBrush.key}}"`;
  } else {
    if (fills && fills.length > 0 && fills[0].type == 'SOLID') {
      return `\n\t${xamlNodeType}="${parseColor(fills[0])}"`;
    }
    return "";
  }
}

function parseColor(brush: SolidPaint) {
  return "#" + decimalToHex(brush.opacity) + decimalToHex(brush.color.r) + decimalToHex(brush.color.g) + decimalToHex(brush.color.b);
}

function decimalToHex(d) {
  return (Math.floor(d * 255)).toString(16).padStart(2, '0');
}

function findExistingSolidBrush(fills: ReadonlyArray<Paint>, resources: Array<XamlResource>) : XamlSolidColorBrush {
  if (fills.length == 1 && fills[0].type === 'SOLID' && fills[0].boundVariables != null) {
    const solidFill = fills[0] as SolidPaint;
    return resources.find((brush) => brush.id == solidFill.boundVariables.color.id);
  }
  return null;
}