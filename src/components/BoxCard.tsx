import { useState } from 'react';
import { Check, ClipboardPaste, Copy, Link2, Unlink2 } from 'lucide-react';
import { computeAtemPosition } from '../lib/atemMath';
import {
  ATEM_SOURCES,
  BOX_THEMES,
  MAX_CROP_X,
  MAX_CROP_X_HARD,
  MAX_CROP_Y,
  MAX_CROP_Y_HARD,
} from '../lib/constants';
import { clamp } from '../lib/vmixMath';
import { formatXmlNumber } from '../lib/xmlGenerators';
import { STRINGS } from '../i18n/strings';
import type { BoxClipboard, BoxConfig, BuilderMode, LanguageCode } from '../types/layout';

interface BoxCardProps {
  mode: BuilderMode;
  language: LanguageCode;
  box: BoxConfig;
  isSelected: boolean;
  clipboard: BoxClipboard | null;
  onSelect: () => void;
  onToggleEnabled: () => void;
  onUpdate: (patch: Partial<BoxConfig>) => void;
  onCopy: () => void;
  onPaste: () => void;
}

export function BoxCard({
  mode,
  language,
  box,
  isSelected,
  clipboard,
  onSelect,
  onToggleEnabled,
  onUpdate,
  onCopy,
  onPaste,
}: BoxCardProps) {
  const t = STRINGS[language];
  const theme = BOX_THEMES[box.id - 1] ?? BOX_THEMES[0];
  const [justCopied, setJustCopied] = useState(false);

  const atemPos = computeAtemPosition(box.x, box.y);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1400);
  };

  const handleLeftChange = (raw: number) => {
    const val = clamp(Number.isFinite(raw) ? raw : 0, 0, MAX_CROP_X_HARD);
    onUpdate(box.linkX ? { cropLeft: val, cropRight: val } : { cropLeft: val });
  };

  const handleRightChange = (raw: number) => {
    const val = clamp(Number.isFinite(raw) ? raw : 0, 0, MAX_CROP_X_HARD);
    onUpdate({ cropRight: val });
  };

  const handleTopChange = (raw: number) => {
    const val = clamp(Number.isFinite(raw) ? raw : 0, 0, MAX_CROP_Y_HARD);
    onUpdate(box.linkY ? { cropTop: val, cropBottom: val } : { cropTop: val });
  };

  const handleBottomChange = (raw: number) => {
    const val = clamp(Number.isFinite(raw) ? raw : 0, 0, MAX_CROP_Y_HARD);
    onUpdate({ cropBottom: val });
  };

  if (!box.enabled) {
    return (
      <div className="w-[158px] shrink-0">
        <button
          type="button"
          onClick={onToggleEnabled}
          style={{ backgroundColor: theme.hex, color: theme.pillTextColor }}
          className="flex w-full cursor-pointer items-center justify-between rounded-md px-3.5 py-2.5 text-sm font-semibold opacity-30 shadow-sm transition hover:opacity-80"
        >
          <span>{theme.label}</span>
          <span className="text-[11px] font-bold tracking-wider uppercase">{t.off}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      style={{ '--slider-accent': theme.hex } as React.CSSProperties}
      className={`w-[228px] shrink-0 overflow-hidden rounded-md border bg-white shadow-sm transition ${
        isSelected ? 'border-slate-400 ring-2 ring-slate-300' : 'border-slate-200'
      }`}
    >
      {/* Card Header */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleEnabled();
        }}
        style={{ backgroundColor: theme.hex, color: theme.pillTextColor }}
        className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm font-semibold transition hover:brightness-95"
      >
        <span>{theme.label}</span>
        <span className="text-[11px] font-bold tracking-wider uppercase">{t.on}</span>
      </button>

      {/* Card Body */}
      <div className="space-y-3 p-3.5 text-xs text-slate-700">
        {/* ATEM Source Selector */}
        {mode === 'atem' && (
          <div className="border-b border-slate-100 pb-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {t.source}
              </span>
              <select
                aria-label={`${theme.label} ${t.source}`}
                value={box.atemSource}
                onChange={(e) => onUpdate({ atemSource: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full cursor-pointer rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              >
                {ATEM_SOURCES.map((src) => (
                  <option key={src.value} value={src.value}>
                    {src.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Position */}
        <div className="border-b border-slate-100 pb-3">
          <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {mode === 'atem' ? t.positionAtem : t.position}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 focus-within:border-sky-400 focus-within:bg-white">
              <span className="font-semibold text-slate-400">x</span>
              <input
                type="number"
                step="1"
                aria-label={`${theme.label} X position`}
                value={box.x}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onUpdate({ x: Number.isFinite(v) ? v : 0 });
                }}
                className="w-full bg-transparent font-mono text-xs text-slate-800 outline-none"
              />
            </label>
            <label className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 focus-within:border-sky-400 focus-within:bg-white">
              <span className="font-semibold text-slate-400">y</span>
              <input
                type="number"
                step="any"
                aria-label={`${theme.label} Y position`}
                value={box.y}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onUpdate({ y: Number.isFinite(v) ? v : 0 });
                }}
                className="w-full bg-transparent font-mono text-xs text-slate-800 outline-none"
              />
            </label>
          </div>
          {mode === 'atem' && (
            <div className="mt-1.5 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-500">
              <span>({formatXmlNumber(atemPos.atemX)})</span>
              <span>({formatXmlNumber(atemPos.atemY)})</span>
            </div>
          )}
        </div>

        {/* Size */}
        <div className="border-b border-slate-100 pb-3">
          <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {t.size}
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            aria-label={`${theme.label} size slider`}
            value={Math.min(1, Math.max(0, box.size))}
            onChange={(e) => onUpdate({ size: parseFloat(e.target.value) })}
            className="studio-slider mb-2 w-full"
          />
          <input
            type="number"
            min={0}
            max={2}
            step={0.01}
            aria-label={`${theme.label} size`}
            value={box.size}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onUpdate({ size: Number.isFinite(v) ? clamp(v, 0, 2) : 0 });
            }}
            className="w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
          />
        </div>

        {/* Crop */}
        <div className="border-b border-slate-100 pb-3">
          <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {t.crop}
          </div>

          {/* Left / Right */}
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-500">{t.left}</div>
              <input
                type="range"
                min={0}
                max={MAX_CROP_X}
                step={1}
                aria-label={`${theme.label} crop left slider`}
                value={Math.min(MAX_CROP_X, box.cropLeft)}
                onChange={(e) => handleLeftChange(parseFloat(e.target.value))}
                className="studio-slider mb-1.5 w-full"
              />
              <input
                type="number"
                min={0}
                max={MAX_CROP_X_HARD}
                step={0.5}
                aria-label={`${theme.label} crop left`}
                value={box.cropLeft}
                onChange={(e) => handleLeftChange(parseFloat(e.target.value))}
                className="w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextLinked = !box.linkX;
                onUpdate(
                  nextLinked
                    ? { linkX: true, cropRight: box.cropLeft }
                    : { linkX: false },
                );
              }}
              title={t.linkCropX}
              aria-label={t.linkCropX}
              aria-pressed={box.linkX}
              className={`mt-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded border transition ${
                box.linkX
                  ? 'border-slate-300 bg-slate-100 text-slate-800'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
              }`}
            >
              {box.linkX ? <Link2 className="h-3.5 w-3.5" /> : <Unlink2 className="h-3.5 w-3.5" />}
            </button>

            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-500">{t.right}</div>
              <input
                type="range"
                min={0}
                max={MAX_CROP_X}
                step={1}
                disabled={box.linkX}
                aria-label={`${theme.label} crop right slider`}
                value={Math.min(MAX_CROP_X, box.cropRight)}
                onChange={(e) => handleRightChange(parseFloat(e.target.value))}
                className="studio-slider mb-1.5 w-full"
              />
              <input
                type="number"
                min={0}
                max={MAX_CROP_X_HARD}
                step={0.5}
                disabled={box.linkX}
                aria-label={`${theme.label} crop right`}
                value={box.cropRight}
                onChange={(e) => handleRightChange(parseFloat(e.target.value))}
                className="w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400 focus:bg-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Top / Bottom */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-500">{t.top}</div>
              <input
                type="range"
                min={0}
                max={MAX_CROP_Y}
                step={1}
                aria-label={`${theme.label} crop top slider`}
                value={Math.min(MAX_CROP_Y, box.cropTop)}
                onChange={(e) => handleTopChange(parseFloat(e.target.value))}
                className="studio-slider mb-1.5 w-full"
              />
              <input
                type="number"
                min={0}
                max={MAX_CROP_Y_HARD}
                step={0.5}
                aria-label={`${theme.label} crop top`}
                value={box.cropTop}
                onChange={(e) => handleTopChange(parseFloat(e.target.value))}
                className="w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextLinked = !box.linkY;
                onUpdate(
                  nextLinked
                    ? { linkY: true, cropBottom: box.cropTop }
                    : { linkY: false },
                );
              }}
              title={t.linkCropY}
              aria-label={t.linkCropY}
              aria-pressed={box.linkY}
              className={`mt-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded border transition ${
                box.linkY
                  ? 'border-slate-300 bg-slate-100 text-slate-800'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
              }`}
            >
              {box.linkY ? <Link2 className="h-3.5 w-3.5" /> : <Unlink2 className="h-3.5 w-3.5" />}
            </button>

            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-500">{t.bottom}</div>
              <input
                type="range"
                min={0}
                max={MAX_CROP_Y}
                step={1}
                disabled={box.linkY}
                aria-label={`${theme.label} crop bottom slider`}
                value={Math.min(MAX_CROP_Y, box.cropBottom)}
                onChange={(e) => handleBottomChange(parseFloat(e.target.value))}
                className="studio-slider mb-1.5 w-full"
              />
              <input
                type="number"
                min={0}
                max={MAX_CROP_Y_HARD}
                step={0.5}
                disabled={box.linkY}
                aria-label={`${theme.label} crop bottom`}
                value={box.cropBottom}
                onChange={(e) => handleBottomChange(parseFloat(e.target.value))}
                className="w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400 focus:bg-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Copy / Paste */}
        <div>
          <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {t.copyPaste}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {justCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>

            {clipboard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPaste();
                }}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded border border-sky-200 bg-sky-50 px-2.5 py-1.5 font-medium text-sky-700 transition hover:bg-sky-100"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>{t.paste}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
