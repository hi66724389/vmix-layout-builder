import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import {
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
  createBox,
  createDefaultBoxes,
} from '../constants';
import { packageMultiviewZip, packageVirtualSetZip, sanitizeZipFilename } from '../exporters';
import {
  computeBoxVisualRect,
  computeCropFractions,
  computeVirtualSetZoom,
  computeVmixPan,
  snapCoordinate,
} from '../vmixMath';
import {
  encodeUtf16LeWithBom,
  generateMultiviewXml,
  generateVirtualSetXml,
} from '../xmlGenerators';

describe('vmixMath', () => {
  it('converts center (384, 216) to Pan (0, 0) without -0', () => {
    const pan = computeVmixPan(384, 216);
    expect(Object.is(pan.panX, -0)).toBe(false);
    expect(Object.is(pan.panY, -0)).toBe(false);
    expect(pan).toEqual({ panX: 0, panY: 0 });
  });

  it('converts off-center coordinates accurately (100, 100) and (192, 108)', () => {
    const p1 = computeVmixPan(100, 100);
    expect(p1.panX).toBeCloseTo(-284 / 384, 12);
    expect(p1.panY).toBeCloseTo(116 / 216, 12);

    const p2 = computeVmixPan(192, 108);
    expect(p2).toEqual({ panX: -0.5, panY: 0.5 });
  });

  it('computes Virtual Set zoom preset and guards size <= 0', () => {
    const zoom = computeVirtualSetZoom(-0.5, 0.5, 0.5);
    expect(zoom).toEqual({ x: 1, y: -1, zoomX: 2, zoomY: 2 });

    const safeZero = computeVirtualSetZoom(-0.5, 0.5, 0);
    expect(safeZero).toEqual({ x: 0, y: 0, zoomX: 1, zoomY: 1 });
  });

  it('snaps coordinates symmetrically around canvas center across all 3 precisions', () => {
    expect(snapCoordinate(387.4, 1, CANVAS_CENTER_X)).toBe(387);
    expect(snapCoordinate(386.6, 4, CANVAS_CENTER_X)).toBe(388);
    expect(snapCoordinate(218.1, 2.25, CANVAS_CENTER_Y)).toBe(218.25);
    expect(snapCoordinate(220.4, 4.5, CANVAS_CENTER_Y)).toBe(220.5);
  });

  it('computes non-inverting normalized crops (X / 32, Y / 18) and exact 1:1 visual rect', () => {
    const box = createBox(1, {
      enabled: true,
      x: 192,
      y: 108,
      size: 0.5,
      cropLeft: 4,
      cropRight: 8,
      cropTop: 3,
      cropBottom: 6,
      linkX: false,
      linkY: false,
    });

    const crop = computeCropFractions(box);
    expect(crop.x1).toBe(0.125);
    expect(crop.x2).toBe(0.75);
    expect(crop.y1).toBeCloseTo(3 / 18, 12);
    expect(crop.y2).toBeCloseTo(12 / 18, 12);

    const rect = computeBoxVisualRect(box);
    expect(rect.outerWidth).toBe(384);
    expect(rect.outerHeight).toBe(216);
    expect(rect.visibleLeft).toBe(384 * 0.125);
    expect(rect.visibleWidth).toBe(384 * (0.75 - 0.125));
    expect(rect.insetLeftPct).toBe(12.5);
    expect(rect.insetRightPct).toBe(25);
  });

  it('clamps max crop cleanly at exact midpoint 0.5 without inversion', () => {
    const box = createBox(1, {
      enabled: true,
      cropLeft: 16,
      cropRight: 16,
      cropTop: 9,
      cropBottom: 9,
    });
    const crop = computeCropFractions(box);
    expect(crop).toEqual({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 });

    const rect = computeBoxVisualRect(box);
    expect(rect.visibleWidth).toBe(0);
    expect(rect.visibleHeight).toBe(0);
  });
});

describe('xmlGenerators & ZIP packaging', () => {
  it('generates default vMix Virtual Set XML matching vMix schema', () => {
    const boxes = createDefaultBoxes();
    const xml = generateVirtualSetXml(boxes);

    expect(xml).toContain('<virtualSet>');
    expect(xml).toContain('<input name="Background" x="0" y="0" zoom="1" dynamic="True">back.png</input>');
    expect(xml).toContain('<zoom name="Full" x="0" y="0" zoomX="1" zoomY="1" rotateX="0" rotateY="0" rotateZ="0" />');
    expect(xml).toContain(
      '<input name="Box1" x="0" y="0" zoomX="0.5" zoomY="0.5" rotateX="0" rotateY="0" rotateZ="0" cropping="0,0,1,1" dynamic="True">1.png</input>',
    );
    expect(xml).toContain(
      '<zoom name="ZoomBox1" x="0" y="0" zoomX="2" zoomY="2" rotateX="0" rotateY="0" rotateZ="0" />',
    );
    expect(xml).not.toContain('Box2');
  });

  it('omits disabled boxes in Virtual Set XML while preserving active box indices', () => {
    const boxes = createDefaultBoxes();
    boxes[0].x = 192;
    boxes[0].y = 108;
    boxes[2].enabled = true; // Box 3 ON, Box 2 stays OFF

    const xml = generateVirtualSetXml(boxes);
    expect(xml).toContain('name="Box1" x="-0.5" y="0.5"');
    expect(xml).not.toContain('Box2');
    expect(xml).toContain('name="Box3" x="0" y="0"');
    expect(xml).toContain('>3.png</input>');
  });

  it('always emits 10 MatrixPosition nodes in Multiview XML with 10th node lacking Clipping', () => {
    const boxes = createDefaultBoxes();
    boxes[2].enabled = true;

    const xml = generateMultiviewXml(boxes);
    const matrixCount = (xml.match(/<MatrixPosition>/g) ?? []).length;
    const clippingCount = (xml.match(/<Clipping>/g) ?? []).length;

    expect(xml.startsWith('<?xml version="1.0" encoding="utf-16"?>')).toBe(true);
    expect(matrixCount).toBe(10);
    expect(clippingCount).toBe(9);
    expect(xml).toContain('<Hidden>false</Hidden>');
    expect(xml).toContain('<Hidden>true</Hidden>');
  });

  it('encodes UTF-16LE with BOM accurately', () => {
    const sample = '<?xml version="1.0" encoding="utf-16"?>\n<Test />';
    const bytes = encodeUtf16LeWithBom(sample);

    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xfe);

    const decoded = new TextDecoder('utf-16le').decode(bytes.subarray(2));
    expect(decoded).toBe(sample);
  });

  it('packages valid Virtual Set and Multiview ZIP archives', async () => {
    const boxes = createDefaultBoxes();
    boxes[2].enabled = true; // Box 1 & Box 3 active

    const dummyPng = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const vsZip = await packageVirtualSetZip({
      boxes,
      setName: 'My: Set / Test',
      backPngBytes: dummyPng,
      boxPngBytesById: { 1: dummyPng, 3: dummyPng },
    });

    expect(vsZip.filename).toBe('My__Set___Test.zip');
    const loadedVsZip = await JSZip.loadAsync(await vsZip.blob.arrayBuffer());
    expect(Object.keys(loadedVsZip.files).sort()).toEqual(['1.png', '3.png', 'back.png', 'config.xml']);
    const configContent = await loadedVsZip.file('config.xml')!.async('string');
    expect(configContent).toContain('name="Box3"');

    const mvZip = await packageMultiviewZip(boxes);
    expect(mvZip.filename).toBe('vMixLayout.zip');
    const loadedMvZip = await JSZip.loadAsync(await mvZip.blob.arrayBuffer());
    expect(Object.keys(loadedMvZip.files)).toEqual(['vMixLayout.xml']);
    const mvBytes = await loadedMvZip.file('vMixLayout.xml')!.async('uint8array');
    expect(mvBytes[0]).toBe(0xff);
    expect(mvBytes[1]).toBe(0xfe);
  });

  it('sanitizes filenames cleanly', () => {
    expect(sanitizeZipFilename('  ')).toBe('vMix_Virtual_Set');
    expect(sanitizeZipFilename('Studio A/B: 2026*')).toBe('Studio_A_B__2026_');
  });
});
