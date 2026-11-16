export type DragPrecision = 'very-precise' | 'medium' | 'coarse';

export type GuideType =
  | 'none'
  | 'center'
  | 'center-gfx'
  | 'center-action'
  | '4x4'
  | '8x8'
  | '16x9'
  | '16x16'
  | '32x18';

export type LanguageCode = 'en' | 'zh-TW';

export interface BoxConfig {
  /** 1-based layer/box number (1..9) */
  id: number;
  enabled: boolean;
  /** Center X on 768x432 reference canvas */
  x: number;
  /** Center Y on 768x432 reference canvas */
  y: number;
  /** Uniform scale factor (0..1+) mapped to vMix ZoomX / ZoomY */
  size: number;
  /** Horizontal crop units (0..16, divided by 32 for normalized 0..0.5) */
  cropLeft: number;
  cropRight: number;
  /** Vertical crop units (0..9, divided by 18 for normalized 0..0.5) */
  cropTop: number;
  cropBottom: number;
  /** When true, editing Left automatically mirrors to Right */
  linkX: boolean;
  /** When true, editing Top automatically mirrors to Bottom */
  linkY: boolean;
}

export type BoxClipboard = Pick<
  BoxConfig,
  'x' | 'y' | 'size' | 'cropLeft' | 'cropRight' | 'cropTop' | 'cropBottom' | 'linkX' | 'linkY'
>;

export interface BoxVisualTheme {
  id: number;
  label: string;
  hex: string;
  darkHex: string;
  pillTextColor: string;
}

export interface PresetDefinition {
  id: string;
  nameEn: string;
  nameZh: string;
  apply: () => BoxConfig[];
}
