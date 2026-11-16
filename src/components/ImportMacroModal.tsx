import { useState } from 'react';
import { X } from 'lucide-react';
import { parseAtemMacroXml, type ParsedAtemMacroResult } from '../lib/atemGenerators';
import { STRINGS } from '../i18n/strings';
import type { LanguageCode } from '../types/layout';

interface ImportMacroModalProps {
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsed: ParsedAtemMacroResult) => void;
}

export function ImportMacroModal({
  language,
  isOpen,
  onClose,
  onImport,
}: ImportMacroModalProps) {
  const t = STRINGS[language];
  const [rawXml, setRawXml] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseAtemMacroXml(rawXml);
    if (!result.ok) {
      if (result.error === 'EMPTY') setErrorMsg(t.importErrorEmpty);
      else if (result.error === 'NO_MACRO_TAG') setErrorMsg(t.importErrorNoMacro);
      else setErrorMsg(t.importErrorNoV2Ops);
      return;
    }

    setErrorMsg(null);
    onImport(result);
    setRawXml('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-macro-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 id="import-macro-title" className="text-lg font-bold text-slate-900">
            {t.importModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.importCancel}
            className="cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 text-sm text-slate-600">{t.importModalDesc}</p>

        <textarea
          rows={10}
          value={rawXml}
          onChange={(e) => {
            setRawXml(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder={t.importModalPlaceholder}
          className="w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />

        {errorMsg && (
          <p className="mt-2 rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
            {errorMsg}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t.importCancel}
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-md bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
          >
            {t.importSubmit}
          </button>
        </div>
      </form>
    </div>
  );
}
