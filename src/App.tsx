import { useEffect, useState } from 'react';
import { AtemExportPanels } from './components/AtemExportPanels';
import { BoxShelf } from './components/BoxShelf';
import { CanvasStage } from './components/CanvasStage';
import { ExportPanels } from './components/ExportPanels';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { ImportMacroModal } from './components/ImportMacroModal';
import type { ParsedAtemMacroResult } from './lib/atemGenerators';
import {
  ATEM_BOX_COUNT,
  DEFAULT_ATEM_SETTINGS,
  DEFAULT_SET_NAME,
  LAYOUT_PRESETS,
  createBox,
  createDefaultBoxes,
} from './lib/constants';
import {
  buildVirtualSetZip,
  packageMultiviewZip,
  renderLayoutPngBlob,
  sanitizeZipFilename,
  triggerDownload,
} from './lib/exporters';
import type {
  AtemExportSettings,
  BoxClipboard,
  BoxConfig,
  BuilderMode,
  DragPrecision,
  GuideType,
  LanguageCode,
} from './types/layout';

function getInitialMode(): BuilderMode {
  if (typeof window === 'undefined') return 'vmix';
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'atem' ? 'atem' : 'vmix';
}

export function App() {
  const [mode, setMode] = useState<BuilderMode>(getInitialMode);
  const [language, setLanguage] = useState<LanguageCode>('zh-TW');
  const [boxes, setBoxes] = useState<BoxConfig[]>(() => createDefaultBoxes());
  const [selectedBoxId, setSelectedBoxId] = useState<number>(1);
  const [dragPrecision, setDragPrecision] = useState<DragPrecision>('medium');
  const [guide, setGuide] = useState<GuideType>('center');
  const [clipboard, setClipboard] = useState<BoxClipboard | null>(null);
  const [setName, setSetName] = useState<string>(DEFAULT_SET_NAME);
  const [atemSettings, setAtemSettings] = useState<AtemExportSettings>(DEFAULT_ATEM_SETTINGS);

  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isImportMacroOpen, setIsImportMacroOpen] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingVirtualSet, setIsExportingVirtualSet] = useState(false);
  const [isExportingMultiview, setIsExportingMultiview] = useState(false);

  useEffect(() => {
    return () => {
      if (backgroundUrl) {
        URL.revokeObjectURL(backgroundUrl);
      }
    };
  }, [backgroundUrl]);

  const handleChangeMode = (nextMode: BuilderMode) => {
    setMode(nextMode);
    if (nextMode === 'atem' && selectedBoxId > ATEM_BOX_COUNT) {
      setSelectedBoxId(1);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('mode', nextMode);
    window.history.replaceState({}, '', url);
  };

  const handleUpdateBox = (boxId: number, patch: Partial<BoxConfig>) => {
    setBoxes((prev) =>
      prev.map((box) => (box.id === boxId ? { ...box, ...patch } : box)),
    );
  };

  const handleMoveBox = (boxId: number, x: number, y: number) => {
    handleUpdateBox(boxId, { x, y });
  };

  const handleToggleBox = (boxId: number) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== boxId) return box;
        const nextEnabled = !box.enabled;
        if (nextEnabled) {
          setSelectedBoxId(boxId);
        }
        return { ...box, enabled: nextEnabled };
      }),
    );
  };

  const handleCopyBox = (boxId: number) => {
    const source = boxes.find((b) => b.id === boxId);
    if (!source) return;
    setClipboard({
      x: source.x,
      y: source.y,
      size: source.size,
      cropLeft: source.cropLeft,
      cropRight: source.cropRight,
      cropTop: source.cropTop,
      cropBottom: source.cropBottom,
      linkX: source.linkX,
      linkY: source.linkY,
      atemSource: source.atemSource,
    });
  };

  const handlePasteBox = (boxId: number) => {
    if (!clipboard) return;
    handleUpdateBox(boxId, { ...clipboard });
    setSelectedBoxId(boxId);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const nextBoxes = preset.apply();
    setBoxes(nextBoxes);
    const firstEnabled = nextBoxes.find((b) => b.enabled);
    setSelectedBoxId(firstEnabled ? firstEnabled.id : 1);
  };

  const handleReset = () => {
    const nextBoxes = createDefaultBoxes();
    setBoxes(nextBoxes);
    setSelectedBoxId(1);
  };

  const handleImportAtemMacro = (parsed: ParsedAtemMacroResult) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id > ATEM_BOX_COUNT) return box;
        const patch = parsed.boxPatches[box.id];
        if (!patch) return box;
        const freshDefaults = createBox(box.id, { enabled: box.enabled });
        return { ...freshDefaults, ...box, ...patch };
      }),
    );

    setAtemSettings((prev) => ({
      ...prev,
      macroName: parsed.macroName ?? prev.macroName,
      macroIndex: parsed.macroIndex ?? prev.macroIndex,
      superSource: parsed.superSource ?? prev.superSource,
    }));

    const firstEnabledId = [1, 2, 3, 4].find((id) => parsed.boxPatches[id]?.enabled);
    if (firstEnabledId) {
      setSelectedBoxId(firstEnabledId);
    }
  };

  const handleUploadBackground = (file: File) => {
    const nextUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.src = nextUrl;
    setBackgroundUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl;
    });
  };

  const handleClearBackground = () => {
    setBackgroundUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setBackgroundImage(null);
  };

  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      const blob = await renderLayoutPngBlob(boxes, backgroundImage, mode);
      const baseName = mode === 'atem' ? atemSettings.macroName : setName;
      triggerDownload(blob, `${sanitizeZipFilename(baseName)}.png`);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadVirtualSet = async () => {
    setIsExportingVirtualSet(true);
    try {
      const { blob, filename } = await buildVirtualSetZip(boxes, setName, backgroundImage);
      triggerDownload(blob, filename);
    } finally {
      setIsExportingVirtualSet(false);
    }
  };

  const handleDownloadMultiview = async () => {
    setIsExportingMultiview(true);
    try {
      const { blob, filename } = await packageMultiviewZip(boxes);
      triggerDownload(blob, filename);
    } finally {
      setIsExportingMultiview(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'zh-TW' : 'en'))}
        onApplyPreset={handleApplyPreset}
        onReset={handleReset}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1">
        <CanvasStage
          mode={mode}
          language={language}
          boxes={boxes}
          selectedBoxId={selectedBoxId}
          dragPrecision={dragPrecision}
          guide={guide}
          backgroundUrl={backgroundUrl}
          onSelectBox={setSelectedBoxId}
          onMoveBox={handleMoveBox}
          onChangeDragPrecision={setDragPrecision}
          onChangeGuide={setGuide}
          onUploadBackground={handleUploadBackground}
          onClearBackground={handleClearBackground}
          onOpenImportMacro={() => setIsImportMacroOpen(true)}
          onExportPng={handleExportPng}
          isExportingPng={isExportingPng}
        />

        <BoxShelf
          mode={mode}
          language={language}
          boxes={boxes}
          selectedBoxId={selectedBoxId}
          clipboard={clipboard}
          onChangeMode={handleChangeMode}
          onSelectBox={setSelectedBoxId}
          onToggleBox={handleToggleBox}
          onUpdateBox={handleUpdateBox}
          onCopyBox={handleCopyBox}
          onPasteBox={handlePasteBox}
        />

        {mode === 'atem' ? (
          <AtemExportPanels
            language={language}
            boxes={boxes}
            settings={atemSettings}
            onUpdateSettings={(patch) =>
              setAtemSettings((prev) => ({ ...prev, ...patch }))
            }
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        ) : (
          <ExportPanels
            language={language}
            boxes={boxes}
            setName={setName}
            onChangeSetName={setSetName}
            onDownloadVirtualSet={handleDownloadVirtualSet}
            onDownloadMultiview={handleDownloadMultiview}
            onOpenHelp={() => setIsHelpOpen(true)}
            isExportingVirtualSet={isExportingVirtualSet}
            isExportingMultiview={isExportingMultiview}
          />
        )}
      </main>

      <HelpModal
        language={language}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <ImportMacroModal
        language={language}
        isOpen={isImportMacroOpen}
        onClose={() => setIsImportMacroOpen(false)}
        onImport={handleImportAtemMacro}
      />
    </div>
  );
}

export default App;
