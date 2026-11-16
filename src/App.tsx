import { useEffect, useState } from 'react';
import { BoxShelf } from './components/BoxShelf';
import { CanvasStage } from './components/CanvasStage';
import { ExportPanels } from './components/ExportPanels';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import {
  DEFAULT_SET_NAME,
  LAYOUT_PRESETS,
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
  BoxClipboard,
  BoxConfig,
  DragPrecision,
  GuideType,
  LanguageCode,
} from './types/layout';

export function App() {
  const [language, setLanguage] = useState<LanguageCode>('zh-TW');
  const [boxes, setBoxes] = useState<BoxConfig[]>(() => createDefaultBoxes());
  const [selectedBoxId, setSelectedBoxId] = useState<number>(1);
  const [dragPrecision, setDragPrecision] = useState<DragPrecision>('medium');
  const [guide, setGuide] = useState<GuideType>('center');
  const [clipboard, setClipboard] = useState<BoxClipboard | null>(null);
  const [setName, setSetName] = useState<string>(DEFAULT_SET_NAME);

  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
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
      const blob = await renderLayoutPngBlob(boxes, backgroundImage);
      triggerDownload(blob, `${sanitizeZipFilename(setName)}.png`);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'zh-TW' : 'en'))}
        onApplyPreset={handleApplyPreset}
        onReset={handleReset}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1">
        <CanvasStage
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
          onExportPng={handleExportPng}
          isExportingPng={isExportingPng}
        />

        <BoxShelf
          language={language}
          boxes={boxes}
          selectedBoxId={selectedBoxId}
          clipboard={clipboard}
          onSelectBox={setSelectedBoxId}
          onToggleBox={handleToggleBox}
          onUpdateBox={handleUpdateBox}
          onCopyBox={handleCopyBox}
          onPasteBox={handlePasteBox}
        />

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
      </main>

      <HelpModal
        language={language}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
