import { HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import { LAYOUT_PRESETS } from '../lib/constants';
import { STRINGS } from '../i18n/strings';
import type { LanguageCode } from '../types/layout';

interface HeaderProps {
  language: LanguageCode;
  onToggleLanguage: () => void;
  onApplyPreset: (presetId: string) => void;
  onReset: () => void;
  onOpenHelp: () => void;
}

export function Header({
  language,
  onToggleLanguage,
  onApplyPreset,
  onReset,
  onOpenHelp,
}: HeaderProps) {
  const t = STRINGS[language];

  return (
    <header className="border-b border-neutral-800 bg-[#1f1f1f] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Brand icon representing the 4-box multi-view layout grid */}
          <div
            className="grid h-8 w-8 grid-cols-2 gap-0.5 rounded-md bg-neutral-700 p-1 shadow-inner"
            aria-hidden="true"
          >
            <span className="rounded-[2px] bg-[#0EA5E9]" />
            <span className="rounded-[2px] bg-[#22C55E]" />
            <span className="rounded-[2px] bg-[#A855F7]" />
            <span className="rounded-[2px] bg-[#EF4444]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
              {t.appTitle}
            </h1>
            <p className="text-[11px] text-neutral-400">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden text-neutral-400 sm:inline">{t.presets}:</span>
            <select
              aria-label={t.presets}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onApplyPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              className="cursor-pointer bg-transparent font-medium text-white outline-none"
            >
              <option value="" disabled className="bg-neutral-900 text-neutral-400">
                {language === 'zh-TW' ? '選擇範本...' : 'Load preset...'}
              </option>
              {LAYOUT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-neutral-900 text-white">
                  {language === 'zh-TW' ? preset.nameZh : preset.nameEn}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.reset}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLanguage}
            className="cursor-pointer rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
            title="Switch Language / 切換語言"
          >
            {language === 'en' ? '繁中' : 'EN'}
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t.docs}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
