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
    return handleFrameNode(nodeObject as FrameNode, resources);
  }
  else if (nodeObject.type === "TEXT") {
    return handleTextNode(nodeObject, resources);
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

function handleTextNode(nodeObject: TextNode, resources: Array<XamlResource>) {
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
}

function handleFrameNode(nodeObject: FrameNode, resources: Array<XamlResource>) {
  let result = `<Border`;

  // Border specific properties
  result += `\n\tStrokeShape="RoundRectangle ${nodeObject.topLeftRadius} ${nodeObject.topRightRadius} ${nodeObject.bottomRightRadius} ${nodeObject.bottomLeftRadius}"`;

  result += parseFill(nodeObject, resources);
  result += parseStrokes(nodeObject, resources);
  if (nodeObject.opacity != 1) {
    result += `\n\tOpacity="${nodeObject.opacity}"`;
  }

  result += parseLayout(nodeObject);

  result += ` />`;
  return result;
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

// VisualElement base properties
function parseLayout(nodeObject: SceneNode) {
  let result = "";

  result += `\n\tWidthRequest="${nodeObject.width}"`;
  result += `\n\tHeightRequest="${nodeObject.height}"`;

  if (nodeObject.minWidth !== null) {
    result += `\n\tMinimumWidthRequest="${nodeObject.minWidth}"`;
  }
  if (nodeObject.minHeight !== null) {
    result += `\n\tMinimumHeightRequest="${nodeObject.minHeight}"`;
  }
  if (nodeObject.maxWidth !== null) {
    result += `\n\tMaximumWidthRequest="${nodeObject.maxWidth}"`;
  }
  if (nodeObject.maxHeight !== null) {
    result += `\n\tMaximumHeightRequest="${nodeObject.maxHeight}"`;
  }

  result += parsePadding(nodeObject as AutoLayoutMixin);

  return result;
}

function parsePadding(nodeObject: AutoLayoutMixin) {
  if (nodeObject.paddingBottom == undefined &&
      nodeObject.paddingLeft == undefined &&
      nodeObject.paddingRight == undefined &&
      nodeObject.paddingTop == undefined) {
      return "";
  } else {
    return `\n\tPadding="${nodeObject.paddingLeft == undefined ? 0 : nodeObject.paddingLeft},` +
    `${nodeObject.paddingTop == undefined ? 0 : nodeObject.paddingTop},` +
    `${nodeObject.paddingRight == undefined ? 0 : nodeObject.paddingRight},` +
    `${nodeObject.paddingBottom == undefined ? 0 : nodeObject.paddingBottom}"`;
  }
}

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