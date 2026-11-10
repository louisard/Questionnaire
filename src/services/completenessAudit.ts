import { CompletenessReport, QuestionnaireAnswers, MaturityLevel } from '../types/questionnaire';
import { QUESTIONNAIRE_STEPS } from '../config/questionnaireSchema';
import { isQuestionVisible } from './conditionEngine';
import { isQuestionAnswered } from './validationService';

/**
 * Produit un audit complet et précis de la complétude du questionnaire :
 * - Questions visibles répondues vs manquantes
 * - Découpage strict obligatoire / facultatif
 * - Ventilation de la matrice de maturité sur les 4 niveaux
 * - Identification des points d'attention / clarifications
 */
export function generateCompletenessAudit(answers: QuestionnaireAnswers): CompletenessReport {
  let totalQuestions = 0;
  let visibleQuestionsCount = 0;
  let answeredCount = 0;
  let requiredTotalCount = 0;
  let requiredAnsweredCount = 0;
  let optionalTotalCount = 0;
  let optionalAnsweredCount = 0;

  const missingRequired: CompletenessReport['missingRequired'] = [];
  const missingOptional: CompletenessReport['missingOptional'] = [];
  const pointsToClarify: CompletenessReport['pointsToClarify'] = [];

  const maturityBreakdown: CompletenessReport['maturityBreakdown'] = {
    existing: [],
    shortTerm: [],
    longTerm: [],
    none: [],
  };

  for (const step of QUESTIONNAIRE_STEPS) {
    for (const question of step.questions) {
      totalQuestions++;
      const visible = isQuestionVisible(question, answers);

      if (!visible) {
        continue;
      }

      visibleQuestionsCount++;
      const answered = isQuestionAnswered(question, answers);

      if (question.required) {
        requiredTotalCount++;
        if (answered) {
          requiredAnsweredCount++;
        } else {
          missingRequired.push({
            questionId: question.id,
            stepId: step.id,
            stepTitle: step.shortTitle,
            title: question.title,
          });
        }
      } else {
        optionalTotalCount++;
        if (answered) {
          optionalAnsweredCount++;
        } else {
          missingOptional.push({
            questionId: question.id,
            stepId: step.id,
            stepTitle: step.shortTitle,
            title: question.title,
          });
        }
      }

      if (answered) {
        answeredCount++;
      }

      // Extraction des éléments de matrice de maturité
      if (question.type === 'maturity_matrix' && answers[question.id]) {
        const matrix = answers[question.id] as Record<string, MaturityLevel>;
        if (question.maturityItems) {
          for (const item of question.maturityItems) {
            const level = matrix[item.id];
            if (level === 'EXISTING') {
              maturityBreakdown.existing.push({ questionTitle: question.title, itemLabel: item.label });
            } else if (level === 'SHORT_TERM') {
              maturityBreakdown.shortTerm.push({ questionTitle: question.title, itemLabel: item.label });
            } else if (level === 'LONG_TERM') {
              maturityBreakdown.longTerm.push({ questionTitle: question.title, itemLabel: item.label });
            } else if (level === 'NONE') {
              maturityBreakdown.none.push({ questionTitle: question.title, itemLabel: item.label });
            }
          }
        }
      }

      // Règles d'audit métier spécifiques (Points à clarifier)
      if (
        (question.id === 's10_photos_ready_status' && answers[question.id] === 'photos_non') ||
        (question.id === 's8_photos_ready_status' && answers[question.id] === 'photos_non') ||
        (question.id === 's8_food_photos_stock' && answers[question.id] === 'aucune_photo')
      ) {
        pointsToClarify.push({
          questionId: question.id,
          stepId: step.id,
          title: question.title,
          reason: "Aucune photo culinaire disponible : un shooting photo professionnel de tes spécialités doit être planifié avant la mise en ligne.",
        });
      }

      if (
        (question.id === 's10_logo_availability' && answers[question.id] === 'logo_non') ||
        (question.id === 's8_logo_availability' && answers[question.id] === 'logo_non')
      ) {
        pointsToClarify.push({
          questionId: question.id,
          stepId: step.id,
          title: question.title,
          reason: "Pas de logo officiel : une étape de création graphique et d'identité visuelle est indispensable.",
        });
      }

      if (question.id === 's4_rental_activity_status' && answers[question.id] === 'location_active' && answers['s8_equipment_photos_stock'] === 'photos_materiel_non') {
        pointsToClarify.push({
          questionId: question.id,
          stepId: step.id,
          title: "Photos du matériel loué",
          reason: "La location de matériel est active mais aucune photo n'est disponible pour alimenter le catalogue en ligne.",
        });
      }
    }
  }

  const percentGlobal = visibleQuestionsCount > 0
    ? Math.round((answeredCount / visibleQuestionsCount) * 100)
    : 100;

  return {
    totalQuestions,
    visibleQuestionsCount,
    answeredCount,
    requiredTotalCount,
    requiredAnsweredCount,
    optionalTotalCount,
    optionalAnsweredCount,
    percentGlobal,
    missingRequired,
    missingOptional,
    pointsToClarify,
    maturityBreakdown,
  };
}
