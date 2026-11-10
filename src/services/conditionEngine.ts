import { ConditionRule, QuestionDefinition, QuestionnaireAnswers } from '../types/questionnaire';
import { QUESTIONNAIRE_STEPS } from '../config/questionnaireSchema';

/**
 * Évalue si une règle de condition est satisfaite par rapport aux réponses actuelles
 */
export function isRuleSatisfied(rule: ConditionRule, answers: QuestionnaireAnswers): boolean {
  const currentAnswer = answers[rule.questionId];

  switch (rule.operator) {
    case 'is_not_empty': {
      if (currentAnswer === undefined || currentAnswer === null) return false;
      if (typeof currentAnswer === 'string') return currentAnswer.trim().length > 0;
      if (Array.isArray(currentAnswer)) return currentAnswer.length > 0;
      return true;
    }

    case 'equals': {
      return currentAnswer === rule.value;
    }

    case 'not_equals': {
      return currentAnswer !== rule.value;
    }

    case 'includes': {
      if (!Array.isArray(currentAnswer)) return false;
      return (currentAnswer as any[]).includes(rule.value);
    }

    case 'has_maturity': {
      if (!currentAnswer || typeof currentAnswer !== 'object' || Array.isArray(currentAnswer)) {
        return false;
      }
      const matrix = currentAnswer as Record<string, string>;
      if (!rule.itemId) return false;
      return matrix[rule.itemId] === rule.value;
    }

    default:
      return true;
  }
}

/**
 * Détermine si une question est visible au vu de l'ensemble de ses règles dependsOn
 */
export function isQuestionVisible(question: QuestionDefinition, answers: QuestionnaireAnswers): boolean {
  if (!question.dependsOn || question.dependsOn.length === 0) {
    return true;
  }
  // Toutes les règles de la question doivent être satisfaites (ET logique)
  return question.dependsOn.every((rule) => isRuleSatisfied(rule, answers));
}

/**
 * Récupère l'ensemble des questions visibles pour une étape donnée
 */
export function getVisibleQuestionsForStep(
  stepId: number,
  answers: QuestionnaireAnswers
): QuestionDefinition[] {
  const step = QUESTIONNAIRE_STEPS.find((s) => s.id === stepId);
  if (!step) return [];
  return step.questions.filter((q) => isQuestionVisible(q, answers));
}

/**
 * Nettoyage récursif des réponses orphelines :
 * Si une réponse parente change et qu'une question conditionnelle devient masquée,
 * sa valeur est immédiatement supprimée du dictionnaire de réponses.
 */
export function cleanOrphanAnswers(answers: QuestionnaireAnswers): QuestionnaireAnswers {
  const cleaned: QuestionnaireAnswers = { ...answers };
  let hasChanged = true;

  // On itère tant que des questions masquées continuent d'être détectées
  // (pour gérer les cascades de dépendances A -> B -> C)
  while (hasChanged) {
    hasChanged = false;

    for (const step of QUESTIONNAIRE_STEPS) {
      for (const question of step.questions) {
        if (question.id in cleaned) {
          const visible = isQuestionVisible(question, cleaned);
          if (!visible) {
            delete cleaned[question.id];
            delete cleaned[`${question.id}_custom`];
            hasChanged = true;
          } else {
            // Si la question est visible mais que "Autre" n'est plus sélectionné, purger _custom
            const ans = cleaned[question.id];
            const hasAutre = Array.isArray(ans)
              ? ans.some((v) => typeof v === 'string' && (v === 'autre' || v.startsWith('autre_')))
              : (ans === 'autre' || (typeof ans === 'string' && ans.startsWith('autre_')));

            if (!hasAutre && `${question.id}_custom` in cleaned) {
              delete cleaned[`${question.id}_custom`];
              hasChanged = true;
            }
          }
        } else if (`${question.id}_custom` in cleaned) {
          delete cleaned[`${question.id}_custom`];
          hasChanged = true;
        }
      }
    }
  }

  return cleaned;
}
