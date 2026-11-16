import {
  ATEM_BOX_COUNT,
  ATEM_SCALE_PX,
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
} from './constants';
import { cleanNumber } from './vmixMath';
import type { BoxConfig, BuilderMode } from '../types/layout';

/**
 * Convert 768x432 canvas pixels to ATEM SuperSource coordinates:
 * atemX in [-16, +16], atemY in [-9, +9] (+Y is up).
 */
export function computeAtemPosition(x: number, y: number): { atemX: number; atemY: number } {
  return {
    atemX: cleanNumber((x - CANVAS_CENTER_X) / ATEM_SCALE_PX),
    atemY: cleanNumber((CANVAS_CENTER_Y - y) / ATEM_SCALE_PX),
  };
}

/**
 * Convert ATEM SuperSource coordinates back to 768x432 canvas pixels.
 */
export function atemToCanvasPosition(atemX: number, atemY: number): { x: number; y: number } {
  return {
    x: cleanNumber(CANVAS_CENTER_X + atemX * ATEM_SCALE_PX),
    y: cleanNumber(CANVAS_CENTER_Y - atemY * ATEM_SCALE_PX),
  };
}

/**
 * Return visible boxes ordered from backmost (bottom) to frontmost (top) for rendering.
 * - ATEM SuperSource hardware places Box 1 on top (so Box 4 draws first, Box 1 last).
 * - vMix renders Box 1..Box 9 in ascending layer order (Box 1 first, Box 9 last).
 */
export function getBoxesInDrawOrder(boxes: BoxConfig[], mode: BuilderMode): BoxConfig[] {
  if (mode === 'atem') {
    return boxes.slice(0, ATEM_BOX_COUNT).filter((b) => b.enabled).reverse();
  }
  return boxes.filter((b) => b.enabled);
}
