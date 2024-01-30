import { parseColor, parseNode } from "./Utils";
import { XamlSolidColorBrush } from "./Types/SolidColorBrush";

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
  var xamlNode = parseNode(nodeObject, resources);
  if (xamlNode != null) {
    return xamlNode.buildString();
  }
  return '';
}

function parseBrushes(nodeObject: MinimalFillsMixin | MinimalStrokesMixin) : Array<XamlResource> {
  let resourceDict = new Array<XamlResource>();
  if (nodeObject == null) {
    return resourceDict;
  }

  const asFills = nodeObject as MinimalFillsMixin;
  const asStrokes = nodeObject as MinimalStrokesMixin;

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
  // Figma only supports bound color values as solid paints
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