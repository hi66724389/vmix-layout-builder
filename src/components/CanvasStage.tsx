import { useRef, useState } from 'react';
import { Download, FileCode2, ImagePlus, Trash2 } from 'lucide-react';
import { computeAtemPosition, getBoxesInDrawOrder } from '../lib/atemMath';
import {
  ATEM_SOURCES,
  BOX_THEMES,
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DRAG_PRECISION_CONFIG,
  GUIDE_OPTIONS,
} from '../lib/constants';
import { computeBoxVisualRect, computeVmixPan, snapCoordinate } from '../lib/vmixMath';
import { formatXmlNumber } from '../lib/xmlGenerators';
import { STRINGS } from '../i18n/strings';
import { GuidesOverlay } from './GuidesOverlay';
import type { BoxConfig, BuilderMode, DragPrecision, GuideType, LanguageCode } from '../types/layout';

interface CanvasStageProps {
  mode: BuilderMode;
  language: LanguageCode;
  boxes: BoxConfig[];
  selectedBoxId: number;
  dragPrecision: DragPrecision;
  guide: GuideType;
  backgroundUrl: string | null;
  onSelectBox: (boxId: number) => void;
  onMoveBox: (boxId: number, x: number, y: number) => void;
  onChangeDragPrecision: (precision: DragPrecision) => void;
  onChangeGuide: (guide: GuideType) => void;
  onUploadBackground: (file: File) => void;
  onClearBackground: () => void;
  onOpenImportMacro: () => void;
  onExportPng: () => void;
  isExportingPng: boolean;
}

interface DragState {
  boxId: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startBoxX: number;
  startBoxY: number;
  stageWidth: number;
  stageHeight: number;
}

export function CanvasStage({
  mode,
  language,
  boxes,
  selectedBoxId,
  dragPrecision,
  guide,
  backgroundUrl,
  onSelectBox,
  onMoveBox,
  onChangeDragPrecision,
  onChangeGuide,
  onUploadBackground,
  onClearBackground,
  onOpenImportMacro,
  onExportPng,
  isExportingPng,
}: CanvasStageProps) {
  const t = STRINGS[language];
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const visibleBoxes = getBoxesInDrawOrder(boxes, mode);
  const selectedBox = visibleBoxes.find((b) => b.id === selectedBoxId) ?? null;
  const selectedVmixPan = selectedBox ? computeVmixPan(selectedBox.x, selectedBox.y) : null;
  const selectedAtemPos = selectedBox ? computeAtemPosition(selectedBox.x, selectedBox.y) : null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, box: BoxConfig) => {
    e.preventDefault();
    e.stopPropagation();
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const rect = stageEl.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    onSelectBox(box.id);

    setDragState({
      boxId: box.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startBoxX: box.x,
      startBoxY: box.y,
      stageWidth: Math.max(1, rect.width),
      stageHeight: Math.max(1, rect.height),
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, box: BoxConfig) => {
    if (!dragState || dragState.boxId !== box.id || dragState.pointerId !== e.pointerId) return;

    const deltaX = ((e.clientX - dragState.startClientX) / dragState.stageWidth) * CANVAS_WIDTH;
    const deltaY = ((e.clientY - dragState.startClientY) / dragState.stageHeight) * CANVAS_HEIGHT;

    const rawX = dragState.startBoxX + deltaX;
    const rawY = dragState.startBoxY + deltaY;

    const step = e.altKey ? { stepX: 1, stepY: 1 } : DRAG_PRECISION_CONFIG[dragPrecision];

    const snappedX = snapCoordinate(rawX, step.stepX, CANVAS_CENTER_X);
    const snappedY = snapCoordinate(rawY, step.stepY, CANVAS_CENTER_Y);

    onMoveBox(box.id, snappedX, snappedY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, box: BoxConfig) => {
    if (dragState && dragState.boxId === box.id && dragState.pointerId === e.pointerId) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setDragState(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedBox) return;
    const precision = DRAG_PRECISION_CONFIG[dragPrecision];
    const stepX = e.shiftKey ? 10 : precision.stepX;
    const stepY = e.shiftKey ? 10 : precision.stepY;

    let nextX = selectedBox.x;
    let nextY = selectedBox.y;

    switch (e.key) {
      case 'ArrowLeft':
        nextX -= stepX;
        break;
      case 'ArrowRight':
        nextX += stepX;
        break;
      case 'ArrowUp':
        nextY -= stepY;
        break;
      case 'ArrowDown':
        nextY += stepY;
        break;
      default:
        return;
    }

    e.preventDefault();
    onMoveBox(
      selectedBox.id,
      snapCoordinate(nextX, stepX, CANVAS_CENTER_X),
      snapCoordinate(nextY, stepY, CANVAS_CENTER_Y),
    );
  };

  return (
    <section className="bg-[#3b3b3b] px-4 py-5 text-neutral-200 sm:px-6">
      <div className="mx-auto max-w-[768px]">
        {/* Top canvas toolbar */}
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 font-semibold tracking-wide text-neutral-300">
            <span>{t.dragPrecision}</span>
            <select
              aria-label={t.dragPrecision}
              value={dragPrecision}
              onChange={(e) => onChangeDragPrecision(e.target.value as DragPrecision)}
              className="cursor-pointer rounded border border-neutral-500 bg-[#2d2d2d] px-2.5 py-1 text-xs font-medium text-white outline-none focus:border-sky-400"
            >
              {(Object.keys(DRAG_PRECISION_CONFIG) as DragPrecision[]).map((key) => (
                <option key={key} value={key}>
                  {language === 'zh-TW'
                    ? DRAG_PRECISION_CONFIG[key].labelZh
                    : DRAG_PRECISION_CONFIG[key].labelEn}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 font-semibold tracking-wide text-neutral-300">
            <span>{t.guides}</span>
            <select
              aria-label={t.guides}
              value={guide}
              onChange={(e) => onChangeGuide(e.target.value as GuideType)}
              className="cursor-pointer rounded border border-neutral-500 bg-[#2d2d2d] px-2.5 py-1 text-xs font-medium text-white outline-none focus:border-sky-400"
            >
              {GUIDE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === 'zh-TW' ? opt.labelZh : opt.labelEn}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 16:9 Interactive Stage */}
        <div
          ref={stageRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="16:9 broadcast layout canvas"
          className="relative aspect-video w-full overflow-hidden rounded-sm border border-neutral-900 bg-[#121212] shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400 select-none"
        >
          {backgroundUrl && (
            <img
              src={backgroundUrl}
              alt="Custom background reference"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          )}

          {visibleBoxes.map((box) => {
            const theme = BOX_THEMES[box.id - 1] ?? BOX_THEMES[0];
            const rect = computeBoxVisualRect(box);
            const isSelected = box.id === selectedBoxId;
            const isDragging = dragState?.boxId === box.id;
            const sourceLabel =
              ATEM_SOURCES.find((s) => s.value === box.atemSource)?.label ?? box.atemSource;

            return (
              <div
                key={box.id}
                id={`box${box.id - 1}`}
                role="button"
                aria-label={`${theme.label} position x ${box.x} y ${box.y}`}
                onPointerDown={(e) => handlePointerDown(e, box)}
                onPointerMove={(e) => handlePointerMove(e, box)}
                onPointerUp={(e) => handlePointerUp(e, box)}
                onPointerCancel={(e) => handlePointerUp(e, box)}
                style={{
                  left: `${(box.x / CANVAS_WIDTH) * 100}%`,
                  top: `${(box.y / CANVAS_HEIGHT) * 100}%`,
                  width: `${Math.max(0, box.size) * 100}%`,
                  height: `${Math.max(0, box.size) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  clipPath: `inset(${rect.insetTopPct}% ${rect.insetRightPct}% ${rect.insetBottomPct}% ${rect.insetLeftPct}%)`,
                  backgroundColor: theme.hex,
                  touchAction: 'none',
                }}
                className={`absolute flex items-center justify-center transition-shadow ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                } ${isSelected ? 'ring-2 ring-white/90 ring-inset' : 'hover:brightness-105'}`}
              >
                {isSelected && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-white/35" />
                    <div className="absolute right-0 left-0 top-1/2 h-px -translate-y-1/2 bg-white/35" />
                  </div>
                )}

                {mode === 'atem' ? (
                  <div
                    style={{
                      backgroundColor: theme.darkHex,
                      color: theme.pillTextColor,
                    }}
                    className="pointer-events-none relative z-10 flex flex-col items-center rounded px-2.5 py-1 shadow-sm"
                  >
                    <span className="text-[9px] font-bold tracking-wider uppercase opacity-85">
                      BOX {box.id}
                    </span>
                    <span className="text-xs font-semibold leading-tight">{sourceLabel}</span>
                  </div>
                ) : (
                  <span
                    style={{
                      backgroundColor: theme.darkHex,
                      color: theme.pillTextColor,
                    }}
                    className="pointer-events-none relative z-10 rounded px-2.5 py-1 text-xs font-semibold shadow-sm"
                  >
                    {theme.label}
                  </span>
                )}
              </div>
            );
          })}

          <GuidesOverlay guide={guide} />
        </div>

        {/* Bottom canvas toolbar */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide text-neutral-300">{t.imageLabel}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUploadBackground(file);
                }
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-neutral-500 bg-[#2d2d2d] px-2.5 py-1 font-semibold text-neutral-100 transition hover:bg-neutral-600"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              <span>{t.upload}</span>
            </button>
            {backgroundUrl && (
              <button
                type="button"
                onClick={onClearBackground}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-neutral-600 bg-neutral-800 px-2 py-1 font-medium text-neutral-300 transition hover:border-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
                <span>{t.clearImage}</span>
              </button>
            )}
          </div>

          {mode === 'atem' ? (
            <button
              type="button"
              onClick={onOpenImportMacro}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-sky-400/70 bg-[#2d2d2d] px-3 py-1 font-semibold text-sky-200 transition hover:bg-sky-600 hover:text-white"
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>{t.importMacro}</span>
            </button>
          ) : (
            selectedBox &&
            selectedVmixPan && (
              <div className="hidden items-center gap-2 rounded bg-[#2b2b2b] px-2.5 py-1 font-mono text-[11px] text-neutral-300 sm:flex">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: BOX_THEMES[selectedBox.id - 1]?.hex }}
                />
                <span>
                  Box {selectedBox.id}: ({formatXmlNumber(selectedBox.x)}, {formatXmlNumber(selectedBox.y)})
                  {' · '}Pan({formatXmlNumber(selectedVmixPan.panX)}, {formatXmlNumber(selectedVmixPan.panY)})
                </span>
              </div>
            )
          )}

          <button
            type="button"
            onClick={onExportPng}
            disabled={isExportingPng}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-neutral-500 bg-[#2d2d2d] px-3 py-1 font-semibold text-neutral-100 transition hover:bg-neutral-600 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.exportPng}</span>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-neutral-400">
          <span>{t.dragHint}</span>
          {mode === 'atem' && selectedBox && selectedAtemPos && (
            <span className="rounded bg-[#2b2b2b] px-2 py-0.5 font-mono text-neutral-300">
              Box {selectedBox.id} ATEM: ({formatXmlNumber(selectedAtemPos.atemX)},{' '}
              {formatXmlNumber(selectedAtemPos.atemY)})
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
