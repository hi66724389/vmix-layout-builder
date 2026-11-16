import type { LanguageCode } from '../types/layout';

export interface UiStrings {
  appTitle: string;
  appSubtitle: string;
  presets: string;
  reset: string;
  docs: string;
  dragPrecision: string;
  guides: string;
  imageLabel: string;
  upload: string;
  clearImage: string;
  exportPng: string;
  on: string;
  off: string;
  position: string;
  size: string;
  crop: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
  linkCropX: string;
  linkCropY: string;
  copyPaste: string;
  copy: string;
  copied: string;
  paste: string;
  virtualSetTitle: string;
  virtualSetDesc: string;
  setNameLabel: string;
  downloadVirtualSet: string;
  multiviewTitle: string;
  multiviewDesc: string;
  downloadMultiview: string;
  copyXml: string;
  needHelp: string;
  activeLayers: string;
  dragHint: string;
  helpTitle: string;
  helpClose: string;
  helpVirtualSetTitle: string;
  helpVirtualSetSteps: string[];
  helpMultiviewTitle: string;
  helpMultiviewSteps: string[];
  helpShortcutsTitle: string;
  helpShortcuts: string[];
}

export const STRINGS: Record<LanguageCode, UiStrings> = {
  en: {
    appTitle: 'vMix Layout Builder',
    appSubtitle: 'Virtual Set & Multiview Designer',
    presets: 'Presets',
    reset: 'Reset',
    docs: 'How to use in vMix',
    dragPrecision: 'DRAG PRECISION',
    guides: 'GUIDES',
    imageLabel: 'IMAGE',
    upload: 'UPLOAD',
    clearImage: 'CLEAR',
    exportPng: 'EXPORT AS PNG',
    on: 'ON',
    off: 'OFF',
    position: 'POSITION',
    size: 'SIZE',
    crop: 'CROP',
    left: 'Left',
    right: 'Right',
    top: 'Top',
    bottom: 'Bottom',
    linkCropX: 'Link Left & Right crop',
    linkCropY: 'Link Top & Bottom crop',
    copyPaste: 'COPY/PASTE',
    copy: 'Copy',
    copied: 'Copied',
    paste: 'Paste',
    virtualSetTitle: 'vMix Virtual Set',
    virtualSetDesc: 'Exports config.xml with back.png and placeholder layer PNGs inside a ZIP archive.',
    setNameLabel: 'Set Name',
    downloadVirtualSet: 'Download Virtual Set',
    multiviewTitle: 'vMix Layers/Multiview',
    multiviewDesc: 'Exports 10-layer ArrayOfMatrixPosition UTF-16 XML inside vMixLayout.zip.',
    downloadMultiview: 'Download layout',
    copyXml: 'Copy XML',
    needHelp: 'Need help?',
    activeLayers: 'Active boxes',
    dragHint: 'Drag boxes on canvas or use Arrow keys to nudge (Shift = 10px, Alt+Drag = 1px)',
    helpTitle: 'How to use exported files in vMix',
    helpClose: 'Close',
    helpVirtualSetTitle: '1. Import as vMix Virtual Set',
    helpVirtualSetSteps: [
      'Design your layout using Box 1–9 and optionally upload a reference background image.',
      'Enter a Set Name and click "Download Virtual Set" to save the .zip archive.',
      'Unzip the folder on your vMix computer (it contains config.xml, back.png, and 1.png..9.png).',
      'In vMix, click "Add Input" -> "Virtual Set" -> "Browse" and select the unzipped folder.',
      'Open the Virtual Set input Setup tab to assign your cameras to Box1, Box2, etc., and use Full / ZoomBox1..N camera presets.',
    ],
    helpMultiviewTitle: '2. Import into vMix Input MultiView / Layers',
    helpMultiviewSteps: [
      'Click "Download layout" in the vMix Layers/Multiview section to download vMixLayout.zip.',
      'Extract vMixLayout.xml from the zip archive.',
      'In vMix, open any Input Settings -> "Layers" (or "MultiView") tab.',
      'Use the template/layout import option (or load the matrix XML) to apply all 10 layer positions, zoom, and clipping.',
    ],
    helpShortcutsTitle: 'Tips & Coordinate System',
    helpShortcuts: [
      'Canvas uses a 768×432 16:9 coordinate space centered at (384, 216), converted to vMix PanX / PanY (-1 to +1).',
      'Horizontal crop (Left/Right) uses 0–16 out of 32 units (0%–50%); vertical crop (Top/Bottom) uses 0–9 out of 18 units (0%–50%).',
      'Use the chain link icons to mirror symmetric crops, and Copy/Paste to duplicate box geometry rapidly.',
    ],
  },
  'zh-TW': {
    appTitle: 'vMix 版面設計工具',
    appSubtitle: 'Virtual Set 與 Multiview 圖層產生器',
    presets: '快速範本',
    reset: '重設版面',
    docs: 'vMix 使用說明',
    dragPrecision: '拖曳吸附精度',
    guides: '參考輔助線',
    imageLabel: '背景參考圖',
    upload: '上傳圖片',
    clearImage: '清除',
    exportPng: '匯出 PNG',
    on: '開啟',
    off: '關閉',
    position: '位置座標',
    size: '縮放大小',
    crop: '裁切 (CROP)',
    left: '左 Left',
    right: '右 Right',
    top: '上 Top',
    bottom: '下 Bottom',
    linkCropX: '同步左右裁切',
    linkCropY: '同步上下裁切',
    copyPaste: '複製 / 貼上',
    copy: '複製',
    copied: '已複製',
    paste: '貼上',
    virtualSetTitle: 'vMix Virtual Set (虛擬攝影棚)',
    virtualSetDesc: '匯出包含 config.xml、back.png 與圖層佔位圖的 ZIP 壓縮包。',
    setNameLabel: '組合名稱',
    downloadVirtualSet: '下載 Virtual Set',
    multiviewTitle: 'vMix Layers / Multiview (多視窗圖層)',
    multiviewDesc: '匯出 10 層 ArrayOfMatrixPosition (UTF-16 XML) 的 vMixLayout.zip。',
    downloadMultiview: '下載 Layout',
    copyXml: '複製 XML',
    needHelp: '使用說明',
    activeLayers: '啟用圖框',
    dragHint: '可直接拖曳畫布上的圖框，或用方向鍵微調（Shift = 10px，Alt+拖曳 = 1px 精細移動）',
    helpTitle: '如何在 vMix 中匯入使用',
    helpClose: '關閉',
    helpVirtualSetTitle: '1. 匯入為 vMix Virtual Set（虛擬棚）',
    helpVirtualSetSteps: [
      '開啟並調整 Box 1–9 的位置、大小與裁切，必要時可上傳背景參考圖。',
      '輸入「組合名稱」並點擊「下載 Virtual Set」取得 .zip 壓縮檔。',
      '在 vMix 電腦上解壓縮該資料夾（內含 config.xml、back.png 與各圖框的 1.png..9.png）。',
      '在 vMix 左下角點擊「Add Input」→「Virtual Set」→「Browse」選擇剛解壓縮的資料夾。',
      '在虛擬棚設定中將攝影機訊號指定給 Box1、Box2…，並可直接切換自動產生的 Full 與 ZoomBox1..N 鏡位。',
    ],
    helpMultiviewTitle: '2. 匯入至 vMix MultiView / Layers（輸入圖層）',
    helpMultiviewSteps: [
      '在「vMix Layers / Multiview」區塊點擊「下載 Layout」取得 vMixLayout.zip。',
      '解壓縮取得 vMixLayout.xml（已採用 vMix 原生 UTF-16 編碼）。',
      '在 vMix 中打開任意輸入來源的 Settings →「Layers / MultiView」分頁。',
      '載入該 XML 版面範本，即可一次套用 10 個圖層的座標、縮放與裁切數據。',
    ],
    helpShortcutsTitle: '操作提示與座標系統',
    helpShortcuts: [
      '預覽畫布採用 768×432（16:9）座標，中心點 (384, 216) 會自動轉換為 vMix 的 PanX / PanY（-1 至 +1）。',
      '左右裁切範圍為 0–16（對應寬度 32 等份，最高裁切 50%）；上下裁切為 0–9（對應高度 18 等份，最高裁切 50%）。',
      '點擊鎖鏈圖示可同步對稱裁切，使用「複製 / 貼上」可快速將相同尺寸套用至其他圖框。',
    ],
  },
};
