import React, { useState, useMemo } from 'react';
import { useQuestionnaireEngine } from './hooks/useQuestionnaireEngine';
import { QUESTIONNAIRE_STEPS } from './config/questionnaireSchema';
import { Header } from './components/layout/Header';
import { StepWizardBar } from './components/layout/StepWizardBar';
import { StepContainer } from './components/wizard/StepContainer';
import { WizardNavigation } from './components/wizard/WizardNavigation';
import { SummaryStep } from './components/wizard/SummaryStep';
import { generateCompletenessAudit } from './services/completenessAudit';
import { DEMO_PREFILLED_ANSWERS } from './config/demoAnswers';
import { SCHEMA_VERSION, STORAGE_KEYS, VALID_ACCESS_TOKENS } from './config/constants';
import { AccessGate } from './components/auth/AccessGate';

export function App() {
  const {
    state,
    syncMeta,
    isSaving,
    mode,
    switchMode,
    setAnswer,
    goToStep,
    nextStep,
    prevStep,
    replaceState,
    resetAll,
  } = useQuestionnaireEngine();

  // Contrôle d'accès privé par lien sécurisé (?acces=... ou #acces=...)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    // 1. Déjà autorisé précédemment sur ce navigateur
    if (localStorage.getItem(STORAGE_KEYS.AUTH_GATE) === 'true') {
      return true;
    }

    // 2. Vérification dans les paramètres d'URL (?acces=... ou ?token=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('acces') || urlParams.get('token');

      // Vérification dans le fragment hash (#acces=... ou #token=...)
      let hashToken: string | null = null;
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
        hashToken = hashParams.get('acces') || hashParams.get('token');
      }

      const candidate = (queryToken || hashToken)?.trim().toLowerCase();
      if (candidate && VALID_ACCESS_TOKENS.some((tok) => tok.toLowerCase() === candidate)) {
        localStorage.setItem(STORAGE_KEYS.AUTH_GATE, 'true');
        // Nettoyage discret de l'URL pour ne pas laisser le jeton dans l'historique
        const cleanUrl = window.location.pathname + window.location.hash.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
        return true;
      }
    } catch {
      // Ignorer
    }

    return false;
  });

  const [highlightedMissingIds, setHighlightedMissingIds] = useState<string[]>([]);

  // Calcul dynamique de l'audit de complétude
  const audit = useMemo(() => generateCompletenessAudit(state.answers), [state.answers]);

  const currentStepDef = QUESTIONNAIRE_STEPS.find((s) => s.id === state.currentStepId);

  // Si l'accès n'est pas autorisé, afficher l'écran de verrouillage
  if (!isAuthorized) {
    return (
      <AccessGate
        onUnlock={() => {
          localStorage.setItem(STORAGE_KEYS.AUTH_GATE, 'true');
          setIsAuthorized(true);
        }}
      />
    );
  }

  const handleNext = () => {
    setHighlightedMissingIds([]);
    const result = nextStep();

    if (!result.success) {
      setHighlightedMissingIds(result.missingQuestionIds);
      // Scroll vers la première question manquante
      if (result.missingQuestionIds.length > 0) {
        const el = document.getElementById(`question-${result.missingQuestionIds[0]}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setHighlightedMissingIds([]);
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStep = (stepId: number) => {
    setHighlightedMissingIds([]);
    goToStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-amber-100 selection:text-amber-950">
      {/* 1. En-tête épurée & Sélecteur de Mode */}
      <Header
        currentMode={mode}
        onSwitchMode={switchMode}
        onReset={resetAll}
      />

      {/* 2. Barre d'étapes (Wizard) */}
      <StepWizardBar
        currentStepId={state.currentStepId}
        completedStepIds={state.completedStepIds}
        onSelectStep={handleSelectStep}
      />

      {/* 3. Contenu principal : Étapes 1 à 10 ou Étape 11 (Synthèse) */}
      <main className="flex-1 pb-16">
        {state.currentStepId === 11 ? (
          <SummaryStep
            state={state}
            audit={audit}
            onGoToStep={handleSelectStep}
          />
        ) : currentStepDef ? (
          <StepContainer
            step={currentStepDef}
            answers={state.answers}
            highlightedMissingIds={highlightedMissingIds}
            onAnswerChange={setAnswer}
          />
        ) : null}
      </main>

      {/* 4. Barre de navigation (Précédent / Suivant) */}
      {state.currentStepId <= 10 && (
        <WizardNavigation
          currentStepId={state.currentStepId}
          totalSteps={10}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

export default App;
