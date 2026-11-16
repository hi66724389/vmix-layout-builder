import type { LanguageCode } from '../types/layout';

export interface UiStrings {
  appTitle: string;
  appSubtitle: string;
  modeAtem: string;
  modeVmix: string;
  presets: string;
  reset: string;
  docs: string;
  dragPrecision: string;
  guides: string;
  imageLabel: string;
  upload: string;
  clearImage: string;
  importMacro: string;
  exportPng: string;
  on: string;
  off: string;
  source: string;
  position: string;
  positionAtem: string;
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
  atemMacroTitle: string;
  atemMacroDesc: string;
  macroNameLabel: string;
  macroIndexLabel: string;
  superSourceLabel: string;
  setInputSourcesLabel: string;
  copyMacro: string;
  downloadXml: string;
  atemAnimatedTitle: string;
  atemAnimatedDesc: string;
  downloadCompanion: string;
  copyMacros: string;
  justMacrosTitle: string;
  justMacrosDesc: string;
  layoutNameLabel: string;
  layoutIndexLabel: string;
  copyScript: string;
  importModalTitle: string;
  importModalDesc: string;
  importModalPlaceholder: string;
  importCancel: string;
  importSubmit: string;
  importErrorEmpty: string;
  importErrorNoMacro: string;
  importErrorNoV2Ops: string;
  helpTitle: string;
  helpClose: string;
  helpAtemTitle: string;
  helpAtemSteps: string[];
  helpAtemAnimatedTitle: string;
  helpAtemAnimatedSteps: string[];
  helpVirtualSetTitle: string;
  helpVirtualSetSteps: string[];
  helpMultiviewTitle: string;
  helpMultiviewSteps: string[];
  helpShortcutsTitle: string;
  helpShortcuts: string[];
}

export const STRINGS: Record<LanguageCode, UiStrings> = {
  en: {
    appTitle: 'Broadcast Layout Builder',
    appSubtitle: 'ATEM SuperSource & vMix Designer',
    modeAtem: 'ATEM SuperSource',
    modeVmix: 'vMix Virtual Set',
    presets: 'Presets',
    reset: 'Reset',
    docs: 'Docs & Help',
    dragPrecision: 'DRAG PRECISION',
    guides: 'GUIDES',
    imageLabel: 'IMAGE',
    upload: 'UPLOAD',
    clearImage: 'CLEAR',
    importMacro: 'IMPORT MACRO',
    exportPng: 'EXPORT AS PNG',
    on: 'ON',
    off: 'OFF',
    source: 'SOURCE',
    position: 'POSITION',
    positionAtem: 'POSITION (ATEM)',
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
    atemMacroTitle: 'ATEM SuperSource Macro',
    atemMacroDesc: 'Static SuperSource V2 macro XML ready to import into ATEM Software Control.',
    macroNameLabel: 'Macro name',
    macroIndexLabel: 'Macro Index',
    superSourceLabel: 'SuperSource',
    setInputSourcesLabel: 'Set input sources',
    copyMacro: 'Copy macro',
    downloadXml: 'Download .xml',
    atemAnimatedTitle: 'ATEM SuperSource Animated',
    atemAnimatedDesc: 'Generates 8 transition macros (indices 92–99) between Split and Full Screen.',
    downloadCompanion: 'Download Companion page',
    copyMacros: 'Copy macros',
    justMacrosTitle: 'ATEM SuperSource Macro for JustMacros',
    justMacrosDesc: 'Lua SetBox helper snippet for JustMacros multi-layout switching.',
    layoutNameLabel: 'Layout name',
    layoutIndexLabel: 'Layout Index',
    copyScript: 'Copy Lua',
    importModalTitle: 'Import ATEM Macro',
    importModalDesc: 'Paste your previously created ATEM SuperSource V2 macro XML to load it onto the canvas.',
    importModalPlaceholder: 'Paste an ATEM SuperSource macro here (<Macro ...>...</Macro>)',
    importCancel: 'Cancel',
    importSubmit: 'Import',
    importErrorEmpty: 'Please paste an ATEM macro XML snippet first.',
    importErrorNoMacro: 'Could not find a <Macro> element in the pasted text.',
    importErrorNoV2Ops: 'No SuperSourceV2Box operations found (legacy v1 SuperSourceBox tags are not supported).',
    helpTitle: 'How to use exported layouts',
    helpClose: 'Close',
    helpAtemTitle: '1. Import into Blackmagic ATEM Software Control',
    helpAtemSteps: [
      'Switch to ATEM SuperSource mode and design Box 1–4 positions, sizes, crops, and sources.',
      'Set your Macro name, Macro Index (0–99), and SuperSource ID (1 or 2).',
      'Copy the macro XML (or download the .xml file) and wrap/merge into your ATEM Restore XML file.',
      'In ATEM Software Control, go to File -> Restore and select Macros to import.',
      'Use "Import Macro" on the canvas bar anytime to reverse-engineer an existing SuperSource V2 macro.',
    ],
    helpAtemAnimatedTitle: '2. ATEM Animated Transitions & Bitfocus Companion',
    helpAtemAnimatedSteps: [
      'The Animated panel generates macros 92–95 (Split -> Box 1..4 Full) and 96–99 (Box 1..4 Full -> Split).',
      'Click "Download Companion page" to export a ready-to-import .companionconfig page pre-mapped to macros 92–99.',
    ],
    helpVirtualSetTitle: '3. Import as vMix Virtual Set',
    helpVirtualSetSteps: [
      'Switch to vMix Virtual Set mode and configure Box 1–9.',
      'Click "Download Virtual Set", unzip the folder, and in vMix choose Add Input -> Virtual Set -> Browse.',
      'Assign live cameras to Box1..BoxN and trigger generated Full / ZoomBox1..N camera presets.',
    ],
    helpMultiviewTitle: '4. Import into vMix Input MultiView / Layers',
    helpMultiviewSteps: [
      'Click "Download layout" to get vMixLayout.zip and extract vMixLayout.xml (UTF-16LE with BOM).',
      'Open an Input Settings -> Layers / MultiView tab in vMix and load the XML matrix layout.',
    ],
    helpShortcutsTitle: 'Coordinate Reference',
    helpShortcuts: [
      'Canvas uses a 768×432 16:9 coordinate space centered at (384, 216).',
      'ATEM maps 24px = 1 unit: X ranges -16 to +16, Y ranges -9 to +9 (+Y is up). Box 1 renders on top of Box 2–4.',
      'vMix maps normalized PanX / PanY (-1 to +1) and cropping fractions (Left/Right / 32, Top/Bottom / 18).',
    ],
  },
  'zh-TW': {
    appTitle: '導播版面設計工具',
    appSubtitle: 'ATEM SuperSource 與 vMix 版面產生器',
    modeAtem: 'ATEM SuperSource',
    modeVmix: 'vMix Virtual Set',
    presets: '快速範本',
    reset: '重設版面',
    docs: '使用說明',
    dragPrecision: '拖曳吸附精度',
    guides: '參考輔助線',
    imageLabel: '背景參考圖',
    upload: '上傳圖片',
    clearImage: '清除',
    importMacro: '匯入 MACRO',
    exportPng: '匯出 PNG',
    on: '開啟',
    off: '關閉',
    source: '訊號來源 (SOURCE)',
    position: '位置座標',
    positionAtem: '位置座標 (ATEM)',
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
    atemMacroTitle: 'ATEM SuperSource Macro',
    atemMacroDesc: '產生標準 SuperSource V2 靜態 Macro XML，可直接匯入 ATEM Software Control。',
    macroNameLabel: 'Macro 名稱',
    macroIndexLabel: 'Macro 編號',
    superSourceLabel: 'SuperSource',
    setInputSourcesLabel: '同時設定輸入來源',
    copyMacro: '複製 Macro',
    downloadXml: '下載 .xml',
    atemAnimatedTitle: 'ATEM SuperSource 動態過場 (Animated)',
    atemAnimatedDesc: '自動產生 8 組過場 Macro（編號 92–99），用於分割畫面與全螢幕之間平滑縮放。',
    downloadCompanion: '下載 Companion 頁面',
    copyMacros: '複製全部 Macros',
    justMacrosTitle: 'JustMacros 專用腳本 (Lua)',
    justMacrosDesc: '產生用於 JustMacros 的 SetBox 版面切換 Lua 程式碼片段。',
    layoutNameLabel: '版面名稱',
    layoutIndexLabel: '版面編號',
    copyScript: '複製 Lua',
    importModalTitle: '匯入 ATEM Macro',
    importModalDesc: '貼上先前建立的 ATEM SuperSource V2 Macro XML，即可還原成畫布配置。',
    importModalPlaceholder: '在此貼上 ATEM SuperSource Macro XML（<Macro ...>...</Macro>）',
    importCancel: '取消',
    importSubmit: '匯入套用',
    importErrorEmpty: '請先貼上 ATEM Macro XML 內容。',
    importErrorNoMacro: '找不到 <Macro> 標籤，請確認格式是否正確。',
    importErrorNoV2Ops: '找不到 SuperSourceV2Box 指令（不支援舊版 v1 SuperSourceBox 標籤）。',
    helpTitle: '如何使用匯出的設定檔',
    helpClose: '關閉',
    helpAtemTitle: '1. 匯入至 Blackmagic ATEM Software Control',
    helpAtemSteps: [
      '切換至 ATEM SuperSource 模式，調整 Box 1–4 的來源、位置、大小與裁切（ATEM 中 Box 1 位於最上層）。',
      '設定 Macro 名稱、編號（0–99）與 SuperSource 編號（1 或 2）。',
      '複製 Macro XML 或下載 .xml，將內容放進 ATEM 的備份 XML 後於 File → Restore 還原 Macros。',
      '點擊畫布下方的「匯入 MACRO」，也可隨時貼上既有 V2 Macro 反推編輯。',
    ],
    helpAtemAnimatedTitle: '2. ATEM 動畫過場與 Bitfocus Companion',
    helpAtemAnimatedSteps: [
      '動態面板會產生 Macro 92–95（分割 → Box 1..4 全螢幕）與 96–99（Box 1..4 全螢幕 → 分割），共 8 幀線性內插。',
      '點擊「下載 Companion 頁面」可取得對應編號 92–99 的 .companionconfig 設定檔。',
    ],
    helpVirtualSetTitle: '3. 匯入為 vMix Virtual Set（虛擬棚）',
    helpVirtualSetSteps: [
      '切換至 vMix Virtual Set 模式並調整 Box 1–9。',
      '點擊「下載 Virtual Set」並解壓縮，在 vMix 點擊 Add Input → Virtual Set → Browse 選擇該資料夾。',
      '將攝影機指定給 Box1..BoxN，並可使用自動產生的 Full 與 ZoomBox1..N 鏡位。',
    ],
    helpMultiviewTitle: '4. 匯入至 vMix MultiView / Layers（輸入圖層）',
    helpMultiviewSteps: [
      '點擊「下載 Layout」取得 vMixLayout.zip 並解壓縮出 vMixLayout.xml（UTF-16LE + BOM）。',
      '在 vMix 開啟任意輸入來源的 Settings → Layers / MultiView 載入該 XML 版面。',
    ],
    helpShortcutsTitle: '座標系統與換算說明',
    helpShortcuts: [
      '畫布採用 768×432（16:9）座標，中心點為 (384, 216)。',
      'ATEM 模式以 24px = 1 單位換算：X 為 -16 至 +16，Y 為 -9 至 +9（向上為正）；圖層順序以 Box 1 最上層、Box 4 最底層。',
      'vMix 模式以標準化 PanX / PanY（-1 至 +1）與裁切比例（左右 / 32、上下 / 18）輸出。',
    ],
  },
};
