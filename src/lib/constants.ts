import type {
  AtemExportSettings,
  AtemSourceOption,
  BoxConfig,
  BoxVisualTheme,
  DragPrecision,
  GuideType,
  PresetDefinition,
} from '../types/layout';

export const CANVAS_WIDTH = 768;
export const CANVAS_HEIGHT = 432;
export const CANVAS_CENTER_X = CANVAS_WIDTH / 2; // 384
export const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2; // 216

export const ATEM_SCALE_PX = 24; // 768/32 = 24, 432/18 = 24
export const ATEM_BOX_COUNT = 4;
export const VMIX_BOX_COUNT = 9;

export const EXPORT_HD_WIDTH = 1920;
export const EXPORT_HD_HEIGHT = 1080;

export const MAX_CROP_X = 16;
export const MAX_CROP_X_HARD = 32;
export const CROP_DIVISOR_X = 32;

export const MAX_CROP_Y = 9;
export const MAX_CROP_Y_HARD = 18;
export const CROP_DIVISOR_Y = 18;

export const DEFAULT_SET_NAME = 'vMix Virtual Set';

export const DEFAULT_ATEM_SETTINGS: AtemExportSettings = {
  macroName: 'SuperSource Macro',
  macroIndex: 0,
  superSource: 1,
  setInputSources: true,
  justMacrosName: 'SuperSource Layout',
  justMacrosIndex: 0,
};

export const ATEM_SOURCES: AtemSourceOption[] = [
  { value: 'Camera1', label: 'Camera 1', companionInputId: 1 },
  { value: 'Camera2', label: 'Camera 2', companionInputId: 2 },
  { value: 'Camera3', label: 'Camera 3', companionInputId: 3 },
  { value: 'Camera4', label: 'Camera 4', companionInputId: 4 },
  { value: 'Camera5', label: 'Camera 5', companionInputId: 5 },
  { value: 'Camera6', label: 'Camera 6', companionInputId: 6 },
  { value: 'Camera7', label: 'Camera 7', companionInputId: 7 },
  { value: 'Camera8', label: 'Camera 8', companionInputId: 8 },
  { value: 'Camera9', label: 'Camera 9', companionInputId: 9 },
  { value: 'Camera10', label: 'Camera 10', companionInputId: 10 },
  { value: 'Camera11', label: 'Camera 11', companionInputId: 11 },
  { value: 'Camera12', label: 'Camera 12', companionInputId: 12 },
  { value: 'Color1', label: 'Color 1', companionInputId: 2001 },
  { value: 'Color2', label: 'Color 2', companionInputId: 2002 },
  { value: 'MediaPlayer1', label: 'Media Player 1', companionInputId: 3010 },
  { value: 'MediaPlayer2', label: 'Media Player 2', companionInputId: 3020 },
  { value: 'MediaPlayer3', label: 'Media Player 3', companionInputId: 3030 },
  { value: 'MediaPlayer4', label: 'Media Player 4', companionInputId: 3040 },
];

export const BOX_THEMES: BoxVisualTheme[] = [
  { id: 1, label: 'Box 1', hex: '#0EA5E9', darkHex: '#0284C7', pillTextColor: '#FFFFFF', companionRgbInt: 959977 },
  { id: 2, label: 'Box 2', hex: '#22C55E', darkHex: '#16A34A', pillTextColor: '#FFFFFF', companionRgbInt: 2278750 },
  { id: 3, label: 'Box 3', hex: '#A855F7', darkHex: '#9333EA', pillTextColor: '#FFFFFF', companionRgbInt: 11032055 },
  { id: 4, label: 'Box 4', hex: '#EF4444', darkHex: '#DC2626', pillTextColor: '#FFFFFF', companionRgbInt: 15680580 },
  { id: 5, label: 'Box 5', hex: '#F97316', darkHex: '#EA580C', pillTextColor: '#FFFFFF', companionRgbInt: 16347926 },
  { id: 6, label: 'Box 6', hex: '#84CC16', darkHex: '#65A30D', pillTextColor: '#FFFFFF', companionRgbInt: 8702998 },
  { id: 7, label: 'Box 7', hex: '#EC4899', darkHex: '#DB2777', pillTextColor: '#FFFFFF', companionRgbInt: 15485081 },
  { id: 8, label: 'Box 8', hex: '#14B8A6', darkHex: '#0D9488', pillTextColor: '#FFFFFF', companionRgbInt: 1357990 },
  { id: 9, label: 'Box 9', hex: '#EAB308', darkHex: '#CA8A04', pillTextColor: '#1E293B', companionRgbInt: 15381256 },
];

export const DRAG_PRECISION_CONFIG: Record<
  DragPrecision,
  { labelEn: string; labelZh: string; stepX: number; stepY: number }
> = {
  'very-precise': {
    labelEn: 'Very precise (1px)',
    labelZh: '極精細 (1px)',
    stepX: 1,
    stepY: 1,
  },
  medium: {
    labelEn: 'Medium',
    labelZh: '中等 (16:9)',
    stepX: 4,
    stepY: 2.25,
  },
  coarse: {
    labelEn: 'Coarse',
    labelZh: '粗略 (16:9)',
    stepX: 8,
    stepY: 4.5,
  },
};

export const GUIDE_OPTIONS: { value: GuideType; labelEn: string; labelZh: string }[] = [
  { value: 'none', labelEn: 'None', labelZh: '無輔助線' },
  { value: 'center', labelEn: 'Center', labelZh: '中心十字線' },
  { value: 'center-gfx', labelEn: 'Center + GFX', labelZh: '中心 + 圖卡安全區' },
  { value: 'center-action', labelEn: 'Center + Action safe', labelZh: '中心 + 動作安全框' },
  { value: '4x4', labelEn: '4x4', labelZh: '4×4 網格' },
  { value: '8x8', labelEn: '8x8', labelZh: '8×8 網格' },
  { value: '16x9', labelEn: '16x9', labelZh: '16×9 方形網格' },
  { value: '16x16', labelEn: '16x16', labelZh: '16×16 網格' },
  { value: '32x18', labelEn: '32x18', labelZh: '32×18 方形網格' },
];

export function createBox(id: number, overrides: Partial<BoxConfig> = {}): BoxConfig {
  const defaultSource = `Camera${Math.min(id, 12)}`;
  return {
    id,
    enabled: id === 1,
    x: CANVAS_CENTER_X,
    y: CANVAS_CENTER_Y,
    size: 0.5,
    cropLeft: 0,
    cropRight: 0,
    cropTop: 0,
    cropBottom: 0,
    linkX: true,
    linkY: true,
    atemSource: defaultSource,
    ...overrides,
  };
}

export function createDefaultBoxes(): BoxConfig[] {
  return Array.from({ length: VMIX_BOX_COUNT }, (_, idx) => createBox(idx + 1));
}

function buildPresetBoxes(overridesById: Record<number, Partial<BoxConfig>>): BoxConfig[] {
  return Array.from({ length: VMIX_BOX_COUNT }, (_, idx) => {
    const id = idx + 1;
    const patch = overridesById[id];
    if (!patch) {
      return createBox(id, { enabled: false });
    }
    return createBox(id, { enabled: true, ...patch });
  });
}

export const LAYOUT_PRESETS: PresetDefinition[] = [
  {
    id: 'default',
    nameEn: 'Default (Center 50%)',
    nameZh: '預設 (置中 50%)',
    apply: () => createDefaultBoxes(),
  },
  {
    id: 'two-up-16x9',
    nameEn: '2-Up Side-by-Side (16:9)',
    nameZh: '雙畫面並排 (16:9)',
    apply: () =>
      buildPresetBoxes({
        1: { x: 196, y: 216, size: 0.46 },
        2: { x: 572, y: 216, size: 0.46 },
      }),
  },
  {
    id: 'two-up-split',
    nameEn: '2-Up Full-Height Split (Cropped)',
    nameZh: '雙畫面滿高分割 (自動裁切)',
    apply: () =>
      buildPresetBoxes({
        1: { x: 192, y: 216, size: 1, cropLeft: 8, cropRight: 8, linkX: true },
        2: { x: 576, y: 216, size: 1, cropLeft: 8, cropRight: 8, linkX: true },
      }),
  },
  {
    id: 'host-pip',
    nameEn: 'Full Screen + PiP',
    nameZh: '全螢幕主畫面 + 子母畫面',
    apply: () =>
      buildPresetBoxes({
        1: { x: 384, y: 216, size: 1 },
        2: { x: 616, y: 324, size: 0.32 },
      }),
  },
  {
    id: 'three-up-columns',
    nameEn: '3-Up Columns (Cropped)',
    nameZh: '三欄並排 (裁切)',
    apply: () =>
      buildPresetBoxes({
        1: { x: 128, y: 216, size: 1, cropLeft: 11, cropRight: 11, linkX: true },
        2: { x: 384, y: 216, size: 1, cropLeft: 11, cropRight: 11, linkX: true },
        3: { x: 640, y: 216, size: 1, cropLeft: 11, cropRight: 11, linkX: true },
      }),
  },
  {
    id: 'four-up-grid',
    nameEn: '4-Up 2×2 Grid',
    nameZh: '四分割 2×2 網格',
    apply: () =>
      buildPresetBoxes({
        1: { x: 192, y: 108, size: 0.46 },
        2: { x: 576, y: 108, size: 0.46 },
        3: { x: 192, y: 324, size: 0.46 },
        4: { x: 576, y: 324, size: 0.46 },
      }),
  },
  {
    id: 'main-plus-three',
    nameEn: 'Featured + 3 Guests',
    nameZh: '主講者 + 3 位來賓',
    apply: () =>
      buildPresetBoxes({
        1: { x: 256, y: 216, size: 0.65, cropLeft: 3, cropRight: 3, linkX: true },
        2: { x: 628, y: 80, size: 0.3 },
        3: { x: 628, y: 216, size: 0.3 },
        4: { x: 628, y: 352, size: 0.3 },
      }),
  },
];
