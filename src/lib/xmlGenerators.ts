import {
  cleanNumber,
  computeCropFractions,
  computeVirtualSetZoom,
  computeVmixPan,
} from './vmixMath';
import type { BoxConfig } from '../types/layout';

export function formatXmlNumber(value: number): string {
  return String(cleanNumber(value));
}

export function generateVirtualSetXml(boxes: BoxConfig[]): string {
  const lines: string[] = [
    '<virtualSet>',
    '  <input name="Background" x="0" y="0" zoom="1" dynamic="True">back.png</input>',
    '  <zoom name="Full" x="0" y="0" zoomX="1" zoomY="1" rotateX="0" rotateY="0" rotateZ="0" />',
  ];

  for (const box of boxes) {
    if (!box.enabled) continue;
    const { panX, panY } = computeVmixPan(box.x, box.y);
    const { x1, y1, x2, y2 } = computeCropFractions(box);
    const zoomPreset = computeVirtualSetZoom(panX, panY, box.size);
    const sizeStr = formatXmlNumber(Math.max(0, box.size));
    const cropStr = `${formatXmlNumber(x1)},${formatXmlNumber(y1)},${formatXmlNumber(x2)},${formatXmlNumber(y2)}`;

    lines.push(
      `  <input name="Box${box.id}" x="${formatXmlNumber(panX)}" y="${formatXmlNumber(panY)}" zoomX="${sizeStr}" zoomY="${sizeStr}" rotateX="0" rotateY="0" rotateZ="0" cropping="${cropStr}" dynamic="True">${box.id}.png</input>`,
    );
    lines.push(
      `  <zoom name="ZoomBox${box.id}" x="${formatXmlNumber(zoomPreset.x)}" y="${formatXmlNumber(zoomPreset.y)}" zoomX="${formatXmlNumber(zoomPreset.zoomX)}" zoomY="${formatXmlNumber(zoomPreset.zoomY)}" rotateX="0" rotateY="0" rotateZ="0" />`,
    );
  }

  lines.push('</virtualSet>');
  return lines.join('\n');
}

function buildMatrixPositionBlock(box: BoxConfig): string {
  const { panX, panY } = computeVmixPan(box.x, box.y);
  const { x1, y1, x2, y2 } = computeCropFractions(box);
  const sizeStr = formatXmlNumber(Math.max(0, box.size));

  return [
    '  <MatrixPosition>',
    `    <Hidden>${box.enabled ? 'false' : 'true'}</Hidden>`,
    '    <Clipping>',
    `      <float>${formatXmlNumber(x1)}</float>`,
    `      <float>${formatXmlNumber(y1)}</float>`,
    `      <float>${formatXmlNumber(x2)}</float>`,
    `      <float>${formatXmlNumber(y2)}</float>`,
    '    </Clipping>',
    '    <Border>',
    '      <Enabled>false</Enabled>',
    '      <Thickness>0</Thickness>',
    '      <Radius>0</Radius>',
    '      <ColourHTML>White</ColourHTML>',
    '    </Border>',
    '    <Mirror>false</Mirror>',
    `    <ZoomX>${sizeStr}</ZoomX>`,
    `    <ZoomY>${sizeStr}</ZoomY>`,
    '    <PostZoomX>1</PostZoomX>',
    '    <PostZoomY>1</PostZoomY>',
    '    <RotateOrigin>',
    '      <X>0</X>',
    '      <Y>0</Y>',
    '      <Z>0</Z>',
    '    </RotateOrigin>',
    '    <Rotate>',
    '      <X>0</X>',
    '      <Y>0</Y>',
    '      <Z>0</Z>',
    '    </Rotate>',
    `    <PanX>${formatXmlNumber(panX)}</PanX>`,
    `    <PanY>${formatXmlNumber(panY)}</PanY>`,
    '  </MatrixPosition>',
  ].join('\n');
}

function buildBackgroundMatrixPositionBlock(): string {
  return [
    '  <MatrixPosition>',
    '    <Hidden>true</Hidden>',
    '    <Border>',
    '      <Enabled>false</Enabled>',
    '      <Thickness>0</Thickness>',
    '      <Radius>0</Radius>',
    '      <ColourHTML>White</ColourHTML>',
    '    </Border>',
    '    <Mirror>false</Mirror>',
    '    <ZoomX>1</ZoomX>',
    '    <ZoomY>1</ZoomY>',
    '    <PostZoomX>1</PostZoomX>',
    '    <PostZoomY>1</PostZoomY>',
    '    <RotateOrigin>',
    '      <X>0</X>',
    '      <Y>0</Y>',
    '      <Z>0</Z>',
    '    </RotateOrigin>',
    '    <Rotate>',
    '      <X>0</X>',
    '      <Y>0</Y>',
    '      <Z>0</Z>',
    '    </Rotate>',
    '    <PanX>0</PanX>',
    '    <PanY>0</PanY>',
    '  </MatrixPosition>',
  ].join('\n');
}

export function generateMultiviewXml(boxes: BoxConfig[]): string {
  const header = [
    '<?xml version="1.0" encoding="utf-16"?>',
    '<ArrayOfMatrixPosition xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">',
  ];

  const layerBlocks: string[] = [];
  for (let i = 0; i < 9; i++) {
    const box = boxes[i];
    if (box) {
      layerBlocks.push(buildMatrixPositionBlock(box));
    }
  }
  layerBlocks.push(buildBackgroundMatrixPositionBlock());

  return [...header, ...layerBlocks, '</ArrayOfMatrixPosition>'].join('\n');
}

/**
 * Encode a JS UTF-16 string into UTF-16LE bytes with 0xFF 0xFE BOM so vMix's
 * .NET XmlSerializer parses <?xml version="1.0" encoding="utf-16"?> cleanly.
 */
export function encodeUtf16LeWithBom(text: string): Uint8Array {
  const bytes = new Uint8Array(2 + text.length * 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;
  for (let i = 0; i < text.length; i++) {
    const codeUnit = text.charCodeAt(i);
    bytes[2 + i * 2] = codeUnit & 0xff;
    bytes[2 + i * 2 + 1] = codeUnit >> 8;
  }
  return bytes;
}
