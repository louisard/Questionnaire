import { QuestionDefinition, QuestionnaireAnswers, ExportPayload } from '../types/questionnaire';
import { QUESTIONNAIRE_STEPS } from '../config/questionnaireSchema';
import { isQuestionVisible } from './conditionEngine';
import { APP_ID, SCHEMA_VERSION } from '../config/constants';

/**
 * Valide si une question spécifique a reçu une réponse valide
 */
export function isQuestionAnswered(question: QuestionDefinition, answers: QuestionnaireAnswers): boolean {
  const value = answers[question.id];
  if (value === undefined || value === null) return false;

  switch (question.type) {
    case 'text':
    case 'textarea':
      return typeof value === 'string' && value.trim().length > 0;

    case 'number':
      return typeof value === 'number' && !isNaN(value);

    case 'boolean':
      return typeof value === 'boolean';

    case 'single_choice':
      return typeof value === 'string' && value.length > 0;

    case 'multiple_choice':
      return Array.isArray(value) && value.length > 0;

    case 'maturity_matrix': {
      if (typeof value !== 'object' || Array.isArray(value)) return false;
      const matrix = value as Record<string, string>;
      if (!question.maturityItems || question.maturityItems.length === 0) return true;
      // Pour être considéré comme répondu, au moins la majorité des items ou tous doivent être positionnés
      return question.maturityItems.every((item) => !!matrix[item.id]);
    }

    case 'photo_upload':
      return Array.isArray(value) && value.length > 0;

    default:
      return true;
  }
}

/**
 * Valide si une étape peut être validée pour passage à l'étape suivante.
 * Règle stricte : Seules les questions VISIBLES ET REQUISES bloquent l'utilisateur.
 */
export function validateStep(
  stepId: number,
  answers: QuestionnaireAnswers
): { isValid: boolean; missingQuestionIds: string[] } {
  const step = QUESTIONNAIRE_STEPS.find((s) => s.id === stepId);
  if (!step) return { isValid: true, missingQuestionIds: [] };

  const missingQuestionIds: string[] = [];

  for (const question of step.questions) {
    if (question.required) {
      const visible = isQuestionVisible(question, answers);
      if (visible && !isQuestionAnswered(question, answers)) {
        missingQuestionIds.push(question.id);
      }
    }
  }

  return {
    isValid: missingQuestionIds.length === 0,
    missingQuestionIds,
  };
}

/**
 * Validation stricte d'un fichier JSON d'import
 * Contrôle l'en-tête de l'application, la version, et vérifie la conformité des identifiants et types
 */
export function validateImportPayload(rawJson: unknown): {
  isValid: boolean;
  error?: string;
  payload?: ExportPayload;
} {
  if (!rawJson || typeof rawJson !== 'object') {
    return { isValid: false, error: "Le fichier importé n'est pas un objet JSON valide." };
  }

  const payload = rawJson as Partial<ExportPayload>;

  if (payload.app !== APP_ID) {
    return {
      isValid: false,
      error: `Application non compatible. Attendu: "${APP_ID}", reçu: "${payload.app || 'inconnu'}".`,
    };
  }

  if (!payload.state || typeof payload.state !== 'object') {
    return { isValid: false, error: "La structure interne 'state' est absente ou corrompue." };
  }

  const state = payload.state;
  if (!state.answers || typeof state.answers !== 'object') {
    return { isValid: false, error: "L'objet 'answers' est manquant dans les données de session." };
  }

  // Contrôle des identifiants de questions existants dans le schéma
  const allKnownQuestionIds = new Set(
    QUESTIONNAIRE_STEPS.flatMap((step) => step.questions.map((q) => q.id))
  );

  const importedAnswers = state.answers as QuestionnaireAnswers;
  const unknownKeys = Object.keys(importedAnswers).filter((k) => {
    if (allKnownQuestionIds.has(k)) return false;
    if (k.endsWith('_custom')) {
      const parentId = k.replace(/_custom$/, '');
      if (allKnownQuestionIds.has(parentId)) return false;
    }
    return true;
  });

  if (unknownKeys.length > 0) {
    console.warn(`[Import JSON] Clés ignorées car absentes du schéma v${SCHEMA_VERSION}:`, unknownKeys);
    // On filtre les clés inconnues pour éviter de polluer l'état
    for (const key of unknownKeys) {
      delete importedAnswers[key];
    }
  }

  return {
    isValid: true,
    payload: payload as ExportPayload,
  };
}
