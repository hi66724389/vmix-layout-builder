import { STRINGS } from '../i18n/strings';
import { BoxCard } from './BoxCard';
import type { BoxClipboard, BoxConfig, LanguageCode } from '../types/layout';

interface BoxShelfProps {
  language: LanguageCode;
  boxes: BoxConfig[];
  selectedBoxId: number;
  clipboard: BoxClipboard | null;
  onSelectBox: (boxId: number) => void;
  onToggleBox: (boxId: number) => void;
  onUpdateBox: (boxId: number, patch: Partial<BoxConfig>) => void;
  onCopyBox: (boxId: number) => void;
  onPasteBox: (boxId: number) => void;
}

export function BoxShelf({
  language,
  boxes,
  selectedBoxId,
  clipboard,
  onSelectBox,
  onToggleBox,
  onUpdateBox,
  onCopyBox,
  onPasteBox,
}: BoxShelfProps) {
  const t = STRINGS[language];
  const activeCount = boxes.filter((b) => b.enabled).length;

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <span>vMix Virtual Set &amp; Layers</span>
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] text-white">
              {activeCount} / 9 {t.activeLayers}
            </span>
          </div>
        </div>

        <div className="box-shelf-scroll flex items-start gap-3.5 overflow-x-auto pb-3">
          {boxes.map((box) => (
            <BoxCard
              key={box.id}
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
