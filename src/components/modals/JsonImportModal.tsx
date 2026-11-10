import React, { useState } from 'react';
import { QuestionnaireState } from '../../types/questionnaire';
import { validateImportPayload } from '../../services/validationService';
import { Upload, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newState: QuestionnaireState) => void;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateImportPayload(parsed);

        if (!result.isValid || !result.payload) {
          setErrorMsg(result.error || "Fichier JSON non conforme aux spécifications.");
          return;
        }

        setSuccessMsg("Fichier validé avec succès. Chargement de la session…");
        setTimeout(() => {
          onImportSuccess(result.payload!.state);
          onClose();
        }, 500);
      } catch (err) {
        setErrorMsg("Erreur lors de la lecture du fichier : format JSON invalide.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-stone-900">Importer une sauvegarde</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-5 leading-relaxed">
          Sélectionnez un fichier <span className="font-semibold text-stone-700">.json</span> exporté précédemment depuis l'application Traiteur Annie. L'intégrité des données sera strictement vérifiée avant le chargement.
        </p>

        {/* Zone de téléversement */}
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 rounded-xl hover:border-amber-500 hover:bg-amber-50/40 transition cursor-pointer">
          <Upload className="w-8 h-8 text-amber-600 mb-2" />
          <span className="text-xs font-semibold text-stone-700">Cliquez pour choisir un fichier</span>
          <span className="text-[11px] text-stone-400 mt-1">Format JSON uniquement</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
