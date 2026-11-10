import { useState, useEffect, useCallback, useRef } from 'react';
import { QuestionnaireState, QuestionnaireAnswers, SyncMetadata, QuestionAnswerValue } from '../types/questionnaire';
import { persistenceManager } from '../services/persistenceManager';
import { cleanOrphanAnswers } from '../services/conditionEngine';
import { validateStep } from '../services/validationService';

export function useQuestionnaireEngine() {
  const [state, setState] = useState<QuestionnaireState>(() => persistenceManager.loadLocalState());
  const [syncMeta, setSyncMeta] = useState<SyncMetadata>(() => persistenceManager.getSyncMetadata());
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Écoute des événements de synchronisation
  useEffect(() => {
    const unsubscribe = persistenceManager.subscribeToSync((meta) => {
      setSyncMeta(meta);
      setIsSaving(false);
    });
    return unsubscribe;
  }, []);

  // Déclencheur de sauvegarde automatique temporisé (debounce 600ms)
  const triggerAutoSave = useCallback((updatedState: QuestionnaireState) => {
    setIsSaving(true);
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      await persistenceManager.syncWithServer(updatedState);
      setIsSaving(false);
    }, 600);
  }, []);

  /**
   * Met à jour la réponse à une question avec nettoyage récursif automatique des orphelins
   */
  const setAnswer = useCallback((questionId: string, value: QuestionAnswerValue) => {
    setState((prevState) => {
      const rawAnswers = {
        ...prevState.answers,
        [questionId]: value,
      };

      // Si la valeur est vide/désélectionnée, supprimer la clé
      if (
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
      ) {
        delete rawAnswers[questionId];
      }

      // Nettoyage récursif de toutes les sous-questions conditionnelles masquées
      const cleanedAnswers = cleanOrphanAnswers(rawAnswers);

      const nextState: QuestionnaireState = {
        ...prevState,
        answers: cleanedAnswers,
        lastUpdated: new Date().toISOString(),
      };

      // Persistance locale immédiate + sauvegarde asynchrone debouncée
      persistenceManager.saveToLocal(nextState);
      triggerAutoSave(nextState);

      return nextState;
    });
  }, [triggerAutoSave]);

  /**
   * Navigation vers une étape spécifique (libre si étape <= étape la plus haute ou étape précédente)
   */
  const goToStep = useCallback((stepId: number) => {
    setState((prevState) => {
      const nextState = {
        ...prevState,
        currentStepId: stepId,
        lastUpdated: new Date().toISOString(),
      };
      persistenceManager.saveToLocal(nextState);
      triggerAutoSave(nextState);
      return nextState;
    });
  }, [triggerAutoSave]);

  /**
   * Passage à l'étape suivante avec validation des champs requis
   */
  const nextStep = useCallback((): { success: boolean; missingQuestionIds: string[] } => {
    const { isValid, missingQuestionIds } = validateStep(state.currentStepId, state.answers);

    if (!isValid) {
      return { success: false, missingQuestionIds };
    }

    setState((prevState) => {
      const completed = new Set(prevState.completedStepIds);
      completed.add(prevState.currentStepId);

      const nextStepId = Math.min(prevState.currentStepId + 1, 11);
      const nextState: QuestionnaireState = {
        ...prevState,
        currentStepId: nextStepId,
        completedStepIds: Array.from(completed),
        lastUpdated: new Date().toISOString(),
      };

      persistenceManager.saveToLocal(nextState);
      triggerAutoSave(nextState);
      return nextState;
    });

    return { success: true, missingQuestionIds: [] };
  }, [state.currentStepId, state.answers, triggerAutoSave]);

  /**
   * Retour à l'étape précédente
   */
  const prevStep = useCallback(() => {
    setState((prevState) => {
      const prevStepId = Math.max(prevState.currentStepId - 1, 1);
      const nextState: QuestionnaireState = {
        ...prevState,
        currentStepId: prevStepId,
        lastUpdated: new Date().toISOString(),
      };
      persistenceManager.saveToLocal(nextState);
      triggerAutoSave(nextState);
      return nextState;
    });
  }, [triggerAutoSave]);

  /**
   * Remplacement de l'état (après un import JSON valide)
   */
  const replaceState = useCallback((newState: QuestionnaireState) => {
    setState(newState);
    persistenceManager.setSessionId(newState.sessionId);
    persistenceManager.saveToLocal(newState);
    triggerAutoSave(newState);
  }, [triggerAutoSave]);

  /**
   * Réinitialisation complète du questionnaire
   */
  const resetAll = useCallback(() => {
    const fresh = persistenceManager.resetSession();
    setState(fresh);
    triggerAutoSave(fresh);
  }, [triggerAutoSave]);

  /**
   * Bascule entre Mode Normal (Vierge) et Modèle Prérempli
   */
  const switchMode = useCallback((targetMode: 'normal' | 'model') => {
    const switchedState = persistenceManager.switchMode(targetMode);
    setState(switchedState);
    triggerAutoSave(switchedState);
  }, [triggerAutoSave]);

  return {
    state,
    syncMeta,
    isSaving,
    mode: state.mode || 'normal',
    switchMode,
    setAnswer,
    goToStep,
    nextStep,
    prevStep,
    replaceState,
    resetAll,
  };
}
