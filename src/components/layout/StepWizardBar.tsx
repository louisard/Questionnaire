import React, { useState } from 'react';
import { QUESTIONNAIRE_STEPS } from '../../config/questionnaireSchema';
import { Check, Menu, X, ChevronRight } from 'lucide-react';

interface StepWizardBarProps {
  currentStepId: number;
  completedStepIds: number[];
  onSelectStep: (stepId: number) => void;
}

export const StepWizardBar: React.FC<StepWizardBarProps> = ({
  currentStepId,
  completedStepIds,
  onSelectStep,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Liste complète des 11 étapes (10 sections thématiques + Synthèse)
  const allSteps = [
    ...QUESTIONNAIRE_STEPS.map((s) => ({ id: s.id, title: s.title, shortTitle: s.shortTitle })),
    { id: 11, title: 'Synthèse, audit de complétude et exports', shortTitle: 'Synthèse' },
  ];

  const currentStep = allSteps.find((s) => s.id === currentStepId) || allSteps[0];
  const progressPercent = Math.round(((currentStepId - 1) / (allSteps.length - 1)) * 100);

  const handleMobileSelect = (stepId: number) => {
    onSelectStep(stepId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="bg-white border-b border-stone-200/80 px-4 py-2.5 sm:px-6 sticky top-[57px] z-20 shadow-xs">
        <div className="max-w-5xl mx-auto">
          {/* Barre de progression fine commune */}
          <div className="w-full bg-stone-100 rounded-full h-1.5 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-800 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* VUE MOBILE (< md) : MENU BURGER ÉPURÉ ET LISIBLE */}
          <div className="flex md:hidden items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {currentStep.id}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Étape {currentStep.id} sur {allSteps.length}
                </p>
                <p className="text-xs font-extrabold text-stone-900 truncate">
                  {currentStep.shortTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5 font-bold text-xs transition cursor-pointer"
              title="Ouvrir toutes les étapes du questionnaire"
            >
              <Menu className="w-4 h-4 text-amber-700" />
              <span>Étapes</span>
            </button>
          </div>

          {/* VUE DESKTOP / TABLETTE (>= md) : RUBAN HORIZONTAL */}
          <div className="hidden md:flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-1">
            {allSteps.map((step) => {
              const isCurrent = step.id === currentStepId;
              const isCompleted = completedStepIds.includes(step.id);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(step.id)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-amber-100/90 text-amber-950 font-bold ring-2 ring-amber-600/50 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100/80 border border-emerald-200/60'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold tracking-tight ${
                        isCurrent
                          ? 'bg-amber-700 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {step.id}
                    </span>

                    {isCompleted && (
                      <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white"
                        title="Étape complétée"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </span>
                    )}
                  </div>

                  <span className="font-semibold">{step.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DRAWER / PANNEAU BURGER PLEIN ÉCRAN SUR MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-stone-900/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header du drawer */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Navigation du questionnaire
                </h3>
                <p className="text-xs text-stone-500">
                  {completedStepIds.length} sur {allSteps.length} étapes renseignées ({progressPercent}%)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liste verticale des étapes */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {allSteps.map((step) => {
                const isCurrent = step.id === currentStepId;
                const isCompleted = completedStepIds.includes(step.id);

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleMobileSelect(step.id)}
                    className={`w-full min-h-[52px] flex items-center justify-between p-3 rounded-2xl text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-100/80 border-2 border-amber-600 text-amber-950 font-bold'
                        : isCompleted
                        ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-950 hover:bg-emerald-100/70'
                        : 'bg-stone-50 border border-stone-200/80 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                            isCurrent
                              ? 'bg-amber-700 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {step.id}
                        </span>
                        {isCompleted && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold leading-snug">
                          {step.title}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {isCurrent
                            ? 'Étape en cours'
                            : isCompleted
                            ? 'Complétée'
                            : 'À renseigner'}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isCurrent ? 'text-amber-700' : 'text-stone-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
