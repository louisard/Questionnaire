import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WizardNavigationProps {
  currentStepId: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStepId,
  totalSteps,
  onPrev,
  onNext,
  isNextDisabled = false,
}) => {
  const isFirstStep = currentStepId === 1;
  const isLastStep = currentStepId === totalSteps;

  return (
    <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200 py-3.5 px-4 sm:px-6 shadow-lg shadow-stone-900/5">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {/* Bouton Précédent */}
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
            isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'text-stone-700 hover:text-amber-950 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        {/* Bouton Suivant / Accéder à la synthèse */}
        <button
          type="button"
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition cursor-pointer ${
            isLastStep
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
              : 'bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 shadow-amber-900/20'
          }`}
        >
          <span>{isLastStep ? 'Synthèse & Exports' : 'Suivant'}</span>
          {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
