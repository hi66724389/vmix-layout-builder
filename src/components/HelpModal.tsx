import { X } from 'lucide-react';
import { STRINGS } from '../i18n/strings';
import type { LanguageCode } from '../types/layout';

interface HelpModalProps {
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ language, isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;
  const t = STRINGS[language];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 id="help-modal-title" className="text-lg font-bold text-slate-900">
            {t.helpTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.helpClose}
            className="cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="mb-2 font-bold text-sky-700">{t.helpVirtualSetTitle}</h3>
            <ol className="list-decimal space-y-1.5 pl-5">
              {t.helpVirtualSetSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-emerald-700">{t.helpMultiviewTitle}</h3>
            <ol className="list-decimal space-y-1.5 pl-5">
              {t.helpMultiviewSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <h3 className="mb-2 font-bold text-slate-800">{t.helpShortcutsTitle}</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-xs text-slate-600">
              {t.helpShortcuts.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            {t.helpClose}
          </button>
        </div>
      </div>
    </div>
  );
}
