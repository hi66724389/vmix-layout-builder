import { useState } from 'react';
import { Check, Copy, Download, HelpCircle } from 'lucide-react';
import { generateMultiviewXml, generateVirtualSetXml } from '../lib/xmlGenerators';
import { STRINGS } from '../i18n/strings';
import type { BoxConfig, LanguageCode } from '../types/layout';

interface ExportPanelsProps {
  language: LanguageCode;
  boxes: BoxConfig[];
  setName: string;
  onChangeSetName: (name: string) => void;
  onDownloadVirtualSet: () => void;
  onDownloadMultiview: () => void;
  onOpenHelp: () => void;
  isExportingVirtualSet: boolean;
  isExportingMultiview: boolean;
}

export function ExportPanels({
  language,
  boxes,
  setName,
  onChangeSetName,
  onDownloadVirtualSet,
  onDownloadMultiview,
  onOpenHelp,
  isExportingVirtualSet,
  isExportingMultiview,
}: ExportPanelsProps) {
  const t = STRINGS[language];
  const [copiedTarget, setCopiedTarget] = useState<'virtualSet' | 'multiview' | null>(null);

  const virtualSetXml = generateVirtualSetXml(boxes);
  const multiviewXml = generateMultiviewXml(boxes);

  const handleCopyText = async (target: 'virtualSet' | 'multiview', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 1600);
    } catch {
      // Fallback ignored if clipboard permission unavailable
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel 1: vMix Virtual Set */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.virtualSetTitle}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{t.virtualSetDesc}</p>
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

          <div className="mb-4 flex flex-wrap items-end gap-2.5">
            <label className="min-w-[200px] flex-1">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                {t.setNameLabel}
              </span>
              <input
                type="text"
                value={setName}
                onChange={(e) => onChangeSetName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <button
              type="button"
              onClick={onDownloadVirtualSet}
              disabled={isExportingVirtualSet}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.downloadVirtualSet}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyText('virtualSet', virtualSetXml)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copiedTarget === 'virtualSet' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.copyXml}</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-md border border-slate-800 bg-[#18181b]">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#222226] px-3 py-1.5 text-[11px] font-medium text-slate-400">
              <span>config.xml</span>
              <span>UTF-8</span>
            </div>
            <pre className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed text-sky-200">
              <code>{virtualSetXml}</code>
            </pre>
          </div>
        </div>

        {/* Panel 2: vMix Layers/Multiview */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.multiviewTitle}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{t.multiviewDesc}</p>
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

          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onDownloadMultiview}
              disabled={isExportingMultiview}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.downloadMultiview}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyText('multiview', multiviewXml)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copiedTarget === 'multiview' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.copyXml}</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-md border border-slate-800 bg-[#18181b]">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#222226] px-3 py-1.5 text-[11px] font-medium text-slate-400">
              <span>vMixLayout.xml</span>
              <span>UTF-16LE (BOM)</span>
            </div>
            <pre className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed text-emerald-200">
              <code>{multiviewXml}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
