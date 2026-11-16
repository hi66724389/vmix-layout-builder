import {
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CROP_DIVISOR_X,
  CROP_DIVISOR_Y,
  MAX_CROP_X_HARD,
  MAX_CROP_Y_HARD,
} from './constants';
import type { BoxConfig } from '../types/layout';

export interface CropFractions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BoxVisualRect {
  /** Unclipped outer frame coordinates on 768x432 canvas */
  outerLeft: number;
  outerTop: number;
  outerWidth: number;
  outerHeight: number;
  /** Visible clipped region on 768x432 canvas */
  visibleLeft: number;
  visibleTop: number;
  visibleWidth: number;
  visibleHeight: number;
  /** Normalized CSS inset percentages [0..100] */
  insetTopPct: number;
  insetRightPct: number;
  insetBottomPct: number;
  insetLeftPct: number;
}

export function cleanNumber(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Number(value.toPrecision(14));
  return Object.is(rounded, -0) || Math.abs(rounded) < 1e-12 ? 0 : rounded;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Snap a coordinate relative to canvas center (384, 216) so standard 16:9 steps
 * (such as 2.25 and 4.5) align symmetrically around the center of the frame.
 */
export function snapCoordinate(value: number, step: number, centerAnchor: number): number {
  if (step <= 0) return cleanNumber(value);
  const offset = value - centerAnchor;
  const snappedOffset = Math.round(offset / step) * step;
  return cleanNumber(centerAnchor + snappedOffset);
}

/**
 * Convert UI crop units into vMix normalized clipping coordinates:
 * X1 = left / 32, Y1 = top / 18, X2 = 1 - right / 32, Y2 = 1 - bottom / 18
 */
export function computeCropFractions(box: BoxConfig): CropFractions {
  const left = clamp(box.cropLeft, 0, MAX_CROP_X_HARD);
  const right = clamp(box.cropRight, 0, MAX_CROP_X_HARD);
  const top = clamp(box.cropTop, 0, MAX_CROP_Y_HARD);
  const bottom = clamp(box.cropBottom, 0, MAX_CROP_Y_HARD);

  const x1 = cleanNumber(left / CROP_DIVISOR_X);
  const y1 = cleanNumber(top / CROP_DIVISOR_Y);
  const x2 = cleanNumber(Math.max(x1, 1 - right / CROP_DIVISOR_X));
  const y2 = cleanNumber(Math.max(y1, 1 - bottom / CROP_DIVISOR_Y));

  return { x1, y1, x2, y2 };
}

/**
 * Convert 768x432 canvas center position into vMix PanX (-1..1) and PanY (-1..1, +up).
 */
export function computeVmixPan(x: number, y: number): { panX: number; panY: number } {
  const panX = cleanNumber((x - CANVAS_CENTER_X) / CANVAS_CENTER_X);
  const panY = cleanNumber(-(y - CANVAS_CENTER_Y) / CANVAS_CENTER_Y);
  return { panX, panY };
}

/**
 * Compute vMix Virtual Set camera zoom preset that frames a given box full-screen.
 */
export function computeVirtualSetZoom(
  panX: number,
  panY: number,
  size: number,
): { x: number; y: number; zoomX: number; zoomY: number } {
  if (size <= 0) {
    return { x: 0, y: 0, zoomX: 1, zoomY: 1 };
  }
  return {
    x: cleanNumber(-panX / size),
    y: cleanNumber(-panY / size),
    zoomX: cleanNumber(1 / size),
    zoomY: cleanNumber(1 / size),
  };
}

/**
 * Compute exact unclipped and visually clipped pixel bounds on the 768x432 canvas.
 * Shared by both the DOM stage and Canvas 2D PNG exporter for 1:1 visual parity.
 */
export function computeBoxVisualRect(box: BoxConfig): BoxVisualRect {
  const safeSize = Math.max(0, box.size);
  const outerWidth = CANVAS_WIDTH * safeSize;
  const outerHeight = CANVAS_HEIGHT * safeSize;
  const outerLeft = box.x - outerWidth / 2;
  const outerTop = box.y - outerHeight / 2;

  const { x1, y1, x2, y2 } = computeCropFractions(box);
  const insetTopPct = cleanNumber(y1 * 100);
  const insetRightPct = cleanNumber((1 - x2) * 100);
  const insetBottomPct = cleanNumber((1 - y2) * 100);
  const insetLeftPct = cleanNumber(x1 * 100);

  const visibleLeft = outerLeft + outerWidth * x1;
  const visibleTop = outerTop + outerHeight * y1;
  const visibleWidth = Math.max(0, outerWidth * (x2 - x1));
  const visibleHeight = Math.max(0, outerHeight * (y2 - y1));

  return {
    outerLeft,
    outerTop,
    outerWidth,
    outerHeight,
    visibleLeft,
    visibleTop,
    visibleWidth,
    visibleHeight,
    insetTopPct,
    insetRightPct,
    insetBottomPct,
    insetLeftPct,
  };
}
