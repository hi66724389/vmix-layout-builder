import { useState } from 'react';
import { Check, Copy, Download, HelpCircle } from 'lucide-react';
import {
  generateAtemAnimatedMacrosXml,
  generateAtemStaticMacroXml,
  generateCompanionPageConfig,
  generateJustMacrosLua,
} from '../lib/atemGenerators';
import { sanitizeZipFilename, triggerDownload } from '../lib/exporters';
import { clamp } from '../lib/vmixMath';
import { STRINGS } from '../i18n/strings';
import type { AtemExportSettings, BoxConfig, LanguageCode } from '../types/layout';

interface AtemExportPanelsProps {
  language: LanguageCode;
  boxes: BoxConfig[];
  settings: AtemExportSettings;
  onUpdateSettings: (patch: Partial<AtemExportSettings>) => void;
  onOpenHelp: () => void;
}

export function AtemExportPanels({
  language,
  boxes,
  settings,
  onUpdateSettings,
  onOpenHelp,
}: AtemExportPanelsProps) {
  const t = STRINGS[language];
  const [copiedTarget, setCopiedTarget] = useState<'static' | 'animated' | 'justmacros' | null>(
    null,
  );

  const staticMacroXml = generateAtemStaticMacroXml(boxes, settings);
  const animatedMacrosXml = generateAtemAnimatedMacrosXml(boxes, settings);
  const justMacrosLua = generateJustMacrosLua(
    boxes,
    settings.justMacrosName,
    settings.justMacrosIndex,
  );

  const handleCopy = async (target: 'static' | 'animated' | 'justmacros', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 1600);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleDownloadXml = (filename: string, xmlText: string) => {
    const blob = new Blob([xmlText], { type: 'application/xml;charset=utf-8' });
    triggerDownload(blob, filename);
  };

  const handleDownloadCompanion = () => {
    const json = generateCompanionPageConfig(boxes, settings);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    triggerDownload(blob, 'SuperSourceCompanionPage.companionconfig');
  };

  return (
    <section className="bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Panel 1: ATEM SuperSource Static Macro */}
          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.atemMacroTitle}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{t.atemMacroDesc}</p>
              </div>
              <button
                type="button"
                onClick={onOpenHelp}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{t.needHelp}</span>
              </button>
            </div>

            <div className="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <label className="sm:col-span-1">
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  {t.macroNameLabel}
                </span>
                <input
                  type="text"
                  value={settings.macroName}
                  onChange={(e) => onUpdateSettings({ macroName: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  {t.macroIndexLabel}
                </span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  step={1}
                  value={settings.macroIndex}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    onUpdateSettings({
                      macroIndex: Number.isFinite(v) ? clamp(v, 0, 99) : 0,
                    });
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  {t.superSourceLabel}
                </span>
                <input
                  type="number"
                  min={1}
                  max={2}
                  step={1}
                  value={settings.superSource}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    onUpdateSettings({ superSource: v === 2 ? 2 : 1 });
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.setInputSources}
                  onChange={(e) => onUpdateSettings({ setInputSources: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 accent-sky-600"
                />
                <span>{t.setInputSourcesLabel}</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy('static', staticMacroXml)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-500"
                >
                  {copiedTarget === 'static' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t.copyMacro}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadXml(
                      `${sanitizeZipFilename(settings.macroName)}.xml`,
                      staticMacroXml,
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t.downloadXml}</span>
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-md border border-slate-800 bg-[#18181b]">
              <div className="flex items-center justify-between border-b border-slate-800 bg-[#222226] px-3 py-1.5 text-[11px] font-medium text-slate-400">
                <span>SuperSource Macro XML</span>
                <span>SuperSource V2</span>
              </div>
              <pre className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed text-sky-200">
                <code>{staticMacroXml}</code>
              </pre>
            </div>
          </div>

          {/* Panel 2: ATEM SuperSource Animated */}
          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.atemAnimatedTitle}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{t.atemAnimatedDesc}</p>
              </div>
              <button
                type="button"
                onClick={onOpenHelp}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{t.needHelp}</span>
              </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCompanion}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadCompanion}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy('animated', animatedMacrosXml)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {copiedTarget === 'animated' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t.copyMacros}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadXml(
                    `${sanitizeZipFilename(settings.macroName)}_animated.xml`,
                    animatedMacrosXml,
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadXml}</span>
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-md border border-slate-800 bg-[#18181b]">
              <div className="flex items-center justify-between border-b border-slate-800 bg-[#222226] px-3 py-1.5 text-[11px] font-medium text-slate-400">
                <span>Macros 92–99</span>
                <span>8 frames / transition</span>
              </div>
              <pre className="max-h-80 overflow-auto p-3 font-mono text-xs leading-relaxed text-emerald-200">
                <code>{animatedMacrosXml}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Panel 3: JustMacros Lua */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.justMacrosTitle}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{t.justMacrosDesc}</p>
            </div>
            <button
              type="button"
              onClick={onOpenHelp}
              className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t.needHelp}</span>
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="min-w-[200px] flex-1">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t.layoutNameLabel}
              </span>
              <input
                type="text"
                value={settings.justMacrosName}
                onChange={(e) => onUpdateSettings({ justMacrosName: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label className="w-32">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t.layoutIndexLabel}
              </span>
              <input
                type="number"
                min={0}
                max={99}
                step={1}
                value={settings.justMacrosIndex}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  onUpdateSettings({
                    justMacrosIndex: Number.isFinite(v) ? clamp(v, 0, 99) : 0,
                  });
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <button
              type="button"
              onClick={() => handleCopy('justmacros', justMacrosLua)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copiedTarget === 'justmacros' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.copyScript}</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-800 bg-[#18181b]">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#222226] px-3 py-1.5 text-[11px] font-medium text-slate-400">
              <span>JustMacros Lua</span>
              <span>SetBox(...)</span>
            </div>
            <pre className="max-h-48 overflow-auto p-3 font-mono text-xs leading-relaxed text-amber-200">
              <code>{justMacrosLua}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
