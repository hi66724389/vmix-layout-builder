import { ATEM_BOX_COUNT } from '../lib/constants';
import { STRINGS } from '../i18n/strings';
import { BoxCard } from './BoxCard';
import type { BoxClipboard, BoxConfig, BuilderMode, LanguageCode } from '../types/layout';

interface BoxShelfProps {
  mode: BuilderMode;
  language: LanguageCode;
  boxes: BoxConfig[];
  selectedBoxId: number;
  clipboard: BoxClipboard | null;
  onChangeMode: (mode: BuilderMode) => void;
  onSelectBox: (boxId: number) => void;
  onToggleBox: (boxId: number) => void;
  onUpdateBox: (boxId: number, patch: Partial<BoxConfig>) => void;
  onCopyBox: (boxId: number) => void;
  onPasteBox: (boxId: number) => void;
}

export function BoxShelf({
  mode,
  language,
  boxes,
  selectedBoxId,
  clipboard,
  onChangeMode,
  onSelectBox,
  onToggleBox,
  onUpdateBox,
  onCopyBox,
  onPasteBox,
}: BoxShelfProps) {
  const t = STRINGS[language];
  const visibleBoxes = mode === 'atem' ? boxes.slice(0, ATEM_BOX_COUNT) : boxes;
  const activeCount = visibleBoxes.filter((b) => b.enabled).length;

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Mode Switcher Pill + Active Counter */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="hidden sm:block sm:w-32" />

          <div
            role="tablist"
            aria-label="Switcher mode"
            className="mx-auto inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 shadow-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'atem'}
              onClick={() => onChangeMode('atem')}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                mode === 'atem'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.modeAtem}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'vmix'}
              onClick={() => onChangeMode('vmix')}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                mode === 'vmix'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.modeVmix}
            </button>
          </div>

          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:mx-0">
            <span>{t.activeLayers}:</span>
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] text-white">
              {activeCount} / {visibleBoxes.length}
            </span>
          </div>
        </div>

        <div className="box-shelf-scroll flex items-start gap-3.5 overflow-x-auto pb-3">
          {visibleBoxes.map((box) => (
            <BoxCard
              key={box.id}
              mode={mode}
              language={language}
              box={box}
              isSelected={box.id === selectedBoxId && box.enabled}
              clipboard={clipboard}
              onSelect={() => onSelectBox(box.id)}
              onToggleEnabled={() => onToggleBox(box.id)}
              onUpdate={(patch) => onUpdateBox(box.id, patch)}
              onCopy={() => onCopyBox(box.id)}
              onPaste={() => onPasteBox(box.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
