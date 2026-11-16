export type BuilderMode = 'vmix' | 'atem';

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

export interface AtemSourceOption {
  value: string;
  label: string;
  companionInputId: number;
}

export interface BoxConfig {
  /** 1-based layer/box number (1..9 in vMix, 1..4 in ATEM) */
  id: number;
  enabled: boolean;
  /** Center X on 768x432 reference canvas */
  x: number;
  /** Center Y on 768x432 reference canvas */
  y: number;
  /** Uniform scale factor (0..1+) */
  size: number;
  /** Horizontal crop units (0..16 on slider, up to 32 supported; divided by 32) */
  cropLeft: number;
  cropRight: number;
  /** Vertical crop units (0..9 on slider, up to 18 supported; divided by 18) */
  cropTop: number;
  cropBottom: number;
  /** When true, editing Left automatically mirrors to Right */
  linkX: boolean;
  /** When true, editing Top automatically mirrors to Bottom */
  linkY: boolean;
  /** Hardware input source used in ATEM SuperSource mode */
  atemSource: string;
}

export type BoxClipboard = Pick<
  BoxConfig,
  | 'x'
  | 'y'
  | 'size'
  | 'cropLeft'
  | 'cropRight'
  | 'cropTop'
  | 'cropBottom'
  | 'linkX'
  | 'linkY'
  | 'atemSource'
>;

export interface AtemExportSettings {
  macroName: string;
  macroIndex: number;
  /** 1-indexed UI selector (1 or 2), mapped to 0-indexed superSource="0"|"1" in XML */
  superSource: 1 | 2;
  setInputSources: boolean;
  justMacrosName: string;
  justMacrosIndex: number;
}

export interface BoxVisualTheme {
  id: number;
  label: string;
  hex: string;
  darkHex: string;
  pillTextColor: string;
  companionRgbInt: number;
}

export interface PresetDefinition {
  id: string;
  nameEn: string;
  nameZh: string;
  apply: () => BoxConfig[];
}
