import JSZip from 'jszip';
import { getBoxesInDrawOrder } from './atemMath';
import {
  ATEM_SOURCES,
  BOX_THEMES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SET_NAME,
  EXPORT_HD_HEIGHT,
  EXPORT_HD_WIDTH,
} from './constants';
import { computeBoxVisualRect } from './vmixMath';
import {
  encodeUtf16LeWithBom,
  generateMultiviewXml,
  generateVirtualSetXml,
} from './xmlGenerators';
import type { BoxConfig, BuilderMode } from '../types/layout';

export function sanitizeZipFilename(rawName: string): string {
  const trimmed = rawName.trim() || DEFAULT_SET_NAME;
  const cleaned = trimmed.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_');
  return cleaned || 'vMix_Virtual_Set';
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
): void {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const targetRatio = targetWidth / targetHeight;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    drawHeight = targetHeight;
    drawWidth = targetHeight * imgRatio;
    offsetX = (targetWidth - drawWidth) / 2;
  } else {
    drawWidth = targetWidth;
    drawHeight = targetWidth / imgRatio;
    offsetY = (targetHeight - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode canvas as PNG'));
    }, 'image/png');
  });
}

async function canvasToUint8Array(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await canvasToBlob(canvas);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Render the 768x432 preview snapshot (background + cropped boxes + Box N badges),
 * intentionally omitting alignment guides and drag crosshairs.
 */
export async function renderLayoutPngBlob(
  boxes: BoxConfig[],
  backgroundImage: HTMLImageElement | null,
  mode: BuilderMode = 'vmix',
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (backgroundImage) {
    drawCoverImage(ctx, backgroundImage, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  for (const box of getBoxesInDrawOrder(boxes, mode)) {
    if (box.size <= 0) continue;
    const theme = BOX_THEMES[box.id - 1] ?? BOX_THEMES[0];
    const rect = computeBoxVisualRect(box);
    if (rect.visibleWidth <= 0 || rect.visibleHeight <= 0) continue;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.visibleLeft, rect.visibleTop, rect.visibleWidth, rect.visibleHeight);
    ctx.clip();

    ctx.fillStyle = theme.hex;
    ctx.fillRect(rect.outerLeft, rect.outerTop, rect.outerWidth, rect.outerHeight);

    const centerX = rect.outerLeft + rect.outerWidth / 2;
    const centerY = rect.outerTop + rect.outerHeight / 2;

    if (mode === 'atem') {
      const sourceLabel =
        ATEM_SOURCES.find((s) => s.value === box.atemSource)?.label ?? box.atemSource;
      ctx.font = '600 12px Inter, system-ui, -apple-system, sans-serif';
      const textWidth = ctx.measureText(sourceLabel).width;
      const badgeWidth = Math.max(66, Math.ceil(textWidth) + 22);
      const badgeHeight = 36;

      ctx.fillStyle = theme.darkHex;
      drawRoundedRectPath(
        ctx,
        centerX - badgeWidth / 2,
        centerY - badgeHeight / 2,
        badgeWidth,
        badgeHeight,
        5,
      );
      ctx.fill();

      ctx.fillStyle = theme.pillTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 9px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`BOX ${box.id}`, centerX, centerY - 7);
      ctx.font = '600 12px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(sourceLabel, centerX, centerY + 6);
    } else {
      const badgeWidth = 54;
      const badgeHeight = 24;

      ctx.fillStyle = theme.darkHex;
      drawRoundedRectPath(
        ctx,
        centerX - badgeWidth / 2,
        centerY - badgeHeight / 2,
        badgeWidth,
        badgeHeight,
        5,
      );
      ctx.fill();

      ctx.fillStyle = theme.pillTextColor;
      ctx.font = '600 12px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(theme.label, centerX, centerY + 0.5);
    }

    ctx.restore();
  }

  return canvasToBlob(canvas);
}

/**
 * Generate a 1920x1080 placeholder image for vMix Virtual Set assets (back.png or 1.png..9.png).
 */
export async function renderVirtualSetAssetPng(
  options:
    | { kind: 'background'; backgroundImage: HTMLImageElement | null }
    | { kind: 'box'; boxId: number },
): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_HD_WIDTH;
  canvas.height = EXPORT_HD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  if (options.kind === 'background') {
    if (options.backgroundImage) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, EXPORT_HD_WIDTH, EXPORT_HD_HEIGHT);
      drawCoverImage(ctx, options.backgroundImage, EXPORT_HD_WIDTH, EXPORT_HD_HEIGHT);
    } else {
      // Transparent background placeholder so Virtual Set works as clean overlay or background
      ctx.clearRect(0, 0, EXPORT_HD_WIDTH, EXPORT_HD_HEIGHT);
    }
    return canvasToUint8Array(canvas);
  }

  const theme = BOX_THEMES[options.boxId - 1] ?? BOX_THEMES[0];
  ctx.fillStyle = theme.hex;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, 0, EXPORT_HD_WIDTH, EXPORT_HD_HEIGHT);

  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = theme.hex;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, EXPORT_HD_WIDTH - 12, EXPORT_HD_HEIGHT - 12);

  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.darkHex;
  drawRoundedRectPath(ctx, EXPORT_HD_WIDTH / 2 - 140, EXPORT_HD_HEIGHT / 2 - 54, 280, 108, 20);
  ctx.fill();

  ctx.fillStyle = theme.pillTextColor;
  ctx.font = '700 48px Inter, system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.label, EXPORT_HD_WIDTH / 2, EXPORT_HD_HEIGHT / 2);

  return canvasToUint8Array(canvas);
}

/**
 * Pure ZIP packaging function for vMix Virtual Set (unit-testable without DOM canvas).
 */
export async function packageVirtualSetZip(params: {
  boxes: BoxConfig[];
  setName: string;
  backPngBytes: Uint8Array;
  boxPngBytesById: Record<number, Uint8Array>;
}): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();
  const xml = generateVirtualSetXml(params.boxes);
  zip.file('config.xml', xml);
  zip.file('back.png', params.backPngBytes);

  for (const box of params.boxes) {
    if (!box.enabled) continue;
    const pngBytes = params.boxPngBytesById[box.id];
    if (pngBytes) {
      zip.file(`${box.id}.png`, pngBytes);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return {
    blob,
    filename: `${sanitizeZipFilename(params.setName)}.zip`,
  };
}

/**
 * Pure ZIP packaging function for vMix Layers/Multiview (unit-testable without DOM).
 */
export async function packageMultiviewZip(
  boxes: BoxConfig[],
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();
  const xml = generateMultiviewXml(boxes);
  zip.file('vMixLayout.xml', encodeUtf16LeWithBom(xml));
  const blob = await zip.generateAsync({ type: 'blob' });
  return {
    blob,
    filename: 'vMixLayout.zip',
  };
}

export async function buildVirtualSetZip(
  boxes: BoxConfig[],
  setName: string,
  backgroundImage: HTMLImageElement | null,
): Promise<{ blob: Blob; filename: string }> {
  const backPngBytes = await renderVirtualSetAssetPng({
    kind: 'background',
    backgroundImage,
  });

  const boxPngBytesById: Record<number, Uint8Array> = {};
  for (const box of boxes) {
    if (!box.enabled) continue;
    boxPngBytesById[box.id] = await renderVirtualSetAssetPng({
      kind: 'box',
      boxId: box.id,
    });
  }

  return packageVirtualSetZip({
    boxes,
    setName,
    backPngBytes,
    boxPngBytesById,
  });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
