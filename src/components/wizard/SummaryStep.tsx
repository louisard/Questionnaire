import React, { useState } from 'react';
import { QuestionnaireState, CompletenessReport, UploadedPhoto } from '../../types/questionnaire';
import { generateMarkdownSynthesis, generatePhotosZip } from '../../services/exportService';
import { MATURITY_LABELS } from '../../config/constants';
import {
  Download,
  FileText,
  Archive,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface SummaryStepProps {
  state: QuestionnaireState;
  audit: CompletenessReport;
  onGoToStep: (stepId: number) => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ state, audit, onGoToStep }) => {
  const brandName = (state.answers['s1_brand_name'] as string) || (state.answers['q1_brand_name'] as string) || 'Traiteur Annie';
  const photos = (state.answers['s8_uploaded_photos'] as UploadedPhoto[]) || [];

  const [isExportingZip, setIsExportingZip] = useState(false);
  const [downloadSuccessMd, setDownloadSuccessMd] = useState(false);
  const [downloadSuccessZip, setDownloadSuccessZip] = useState(false);

  // 1. Export du Fichier 1 : Traiteur_Annie_Synthese.md
  const handleExportMarkdown = () => {
    const markdownContent = generateMarkdownSynthesis(state, audit);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Traiteur_Annie_Synthese.md';
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMd(true);
    setTimeout(() => setDownloadSuccessMd(false), 4000);
  };

  // 2. Export du Fichier 2 : Traiteur_Annie_Photos.zip
  const handleExportPhotosZip = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await generatePhotosZip(state);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Traiteur_Annie_Photos.zip';
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccessZip(true);
      setTimeout(() => setDownloadSuccessZip(false), 4000);
    } catch (err) {
      console.error("Erreur lors de la création de l'archive ZIP:", err);
      alert("Erreur lors de la génération de l'archive ZIP des photos.");
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* En-tête de synthèse */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Étape 11 • Synthèse & Validation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Cahier de Découverte : {brandName}
        </h2>
        <p className="text-sm text-stone-300 mt-2 max-w-2xl leading-relaxed">
          Toutes tes réponses et tes photos ont été automatiquement consolidées. Télécharge tes deux fichiers officiels ci-dessous pour lancer la création du futur site.
        </p>

        {/* Barre de complétude globale */}
        <div className="mt-6 pt-6 border-t border-amber-800/60">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-amber-200">Complétude globale du questionnaire</span>
            <span className="text-white text-sm font-bold">{audit.percentGlobal}%</span>
          </div>
          <div className="w-full bg-amber-950/80 rounded-full h-3 overflow-hidden border border-amber-700/50">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${audit.percentGlobal}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
            <span>{audit.answeredCount} questions renseignées sur {audit.visibleQuestionsCount} visibles</span>
            <span>{audit.missingRequired.length} obligatoire(s) manquante(s)</span>
          </div>
        </div>

        {/* Les 2 boutons d'export officiels demandés */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {/* Fichier 1 : Synthèse Markdown */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="min-h-[48px] flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-extrabold shadow-md transition cursor-pointer"
          >
            <FileText className="w-5 h-5 text-stone-950" />
            <span>1. Télécharger la Synthèse (Traiteur_Annie_Synthese.md)</span>
            {downloadSuccessMd && <CheckCircle2 className="w-4 h-4 text-emerald-900" />}
          </button>

          {/* Fichier 2 : Archive ZIP Photos */}
          <button
            type="button"
            onClick={handleExportPhotosZip}
            disabled={isExportingZip}
            className="min-h-[48px] flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-extrabold border border-white/25 shadow-md transition cursor-pointer"
          >
            <Archive className="w-5 h-5 text-amber-300" />
            <span>
              {isExportingZip
                ? 'Création du ZIP en cours…'
                : `2. Télécharger les Photos (Traiteur_Annie_Photos.zip • ${photos.length} photo${photos.length > 1 ? 's' : ''})`}
            </span>
            {downloadSuccessZip && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Points d'audit & Alertes de complétude */}
      {(audit.missingRequired.length > 0 || audit.pointsToClarify.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <span>Audit de complétude & Points à clarifier</span>
          </div>

          {/* Questions obligatoires non renseignées */}
          {audit.missingRequired.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-950 mb-2">
                Questions obligatoires restantes :
              </p>
              <div className="space-y-1.5">
                {audit.missingRequired.map((item) => (
                  <button
                    key={item.questionId}
                    type="button"
                    onClick={() => onGoToStep(item.stepId)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200/80 hover:border-amber-400 text-xs text-stone-800 transition cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-amber-800 mr-2">[{item.stepTitle}]</span>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-amber-700 font-medium flex items-center gap-1 text-[11px]">
                      Compléter <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Points de clarification métier */}
          {audit.pointsToClarify.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-amber-950 mb-2">
                Recommandations pour la suite du projet :
              </p>
              <ul className="space-y-1 text-xs text-amber-900 list-disc list-inside">
                {audit.pointsToClarify.map((pt, i) => (
                  <li key={i}>
                    <span className="font-semibold">{pt.title} :</span> {pt.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* MATRICE DE MATURITÉ VISUELLE (4 Colonnes stricts) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-700" />
          <h3 className="text-lg font-bold text-stone-900">
            Matrice de Maturité des Prestations Traiteur & Matériel
          </h3>
        </div>
        <p className="text-xs text-stone-500">
          Vision d'ensemble des offres actuellement opérationnelles et de la trajectoire d'évolution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Colonne EXISTANT */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Existant ({audit.maturityBreakdown.existing.length})
              </h4>
            </div>
            {audit.maturityBreakdown.existing.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Aucune prestation positionnée</p>
            ) : (
              <div className="space-y-2">
                {audit.maturityBreakdown.existing.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-emerald-200/70 text-xs">
                    <p className="font-semibold text-stone-800">{item.itemLabel}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{item.questionTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne COURT TERME */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Court Terme ({audit.maturityBreakdown.shortTerm.length})
              </h4>
            </div>
            {audit.maturityBreakdown.shortTerm.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Aucune prestation positionnée</p>
            ) : (
              <div className="space-y-2">
                {audit.maturityBreakdown.shortTerm.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-amber-200/70 text-xs">
                    <p className="font-semibold text-stone-800">{item.itemLabel}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{item.questionTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne LONG TERME */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                Long Terme ({audit.maturityBreakdown.longTerm.length})
              </h4>
            </div>
            {audit.maturityBreakdown.longTerm.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Aucune prestation positionnée</p>
            ) : (
              <div className="space-y-2">
                {audit.maturityBreakdown.longTerm.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-blue-200/70 text-xs">
                    <p className="font-semibold text-stone-800">{item.itemLabel}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{item.questionTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne NON PRÉVU (4e niveau strict) */}
          <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Non Prévu ({audit.maturityBreakdown.none.length})
              </h4>
            </div>
            {audit.maturityBreakdown.none.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Aucun élément écarté</p>
            ) : (
              <div className="space-y-2">
                {audit.maturityBreakdown.none.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-stone-200 text-xs">
                    <p className="font-semibold text-stone-700">{item.itemLabel}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{item.questionTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
