import React from 'react';
import { StepDefinition, QuestionnaireAnswers, QuestionAnswerValue, UploadedPhoto } from '../../types/questionnaire';
import { isQuestionVisible } from '../../services/conditionEngine';
import { ChoiceCardsField } from '../fields/ChoiceCardsField';
import { MaturityMatrixField } from '../fields/MaturityMatrixField';
import { TextField } from '../fields/TextField';
import { BooleanToggleField } from '../fields/BooleanToggleField';
import { PhotoUploadField } from '../fields/PhotoUploadField';
import { HelpCircle } from 'lucide-react';

interface StepContainerProps {
  step: StepDefinition;
  answers: QuestionnaireAnswers;
  highlightedMissingIds?: string[];
  onAnswerChange: (questionId: string, value: QuestionAnswerValue) => void;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  step,
  answers,
  highlightedMissingIds = [],
  onAnswerChange,
}) => {
  // Filtrer les questions visibles selon les règles conditionnelles
  const visibleQuestions = step.questions.filter((q) => isQuestionVisible(q, answers));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* En-tête de l'étape */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
          <span>Section {step.id} sur 10</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {step.title}
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Liste des questions visibles */}
      <div className="space-y-8">
        {visibleQuestions.map((q, idx) => {
          const isMissing = highlightedMissingIds.includes(q.id);
          const currentAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all ${
                isMissing
                  ? 'border-rose-400 ring-2 ring-rose-300/40 shadow-md'
                  : 'border-stone-200/90 shadow-xs hover:border-stone-300'
              }`}
            >
              {/* En-tête de la question */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        Question {idx + 1}
                      </span>
                      {q.required ? (
                        <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                          Obligatoire
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          Facultatif
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                      {q.title}
                    </h3>
                  </div>
                </div>

                {q.subtitle && (
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    {q.subtitle}
                  </p>
                )}

                {q.helpText && (
                  <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900 leading-relaxed">
                    <HelpCircle className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
                    <span>{q.helpText}</span>
                  </div>
                )}

                {isMissing && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">
                    Cette question obligatoire doit être renseignée pour continuer.
                  </p>
                )}
              </div>

              {/* Rendu du champ selon son type */}
              <div>
                {q.type === 'text' && (
                  <TextField
                    value={currentAnswer as string}
                    onChange={(val) => onAnswerChange(q.id, val)}
                    placeholder={q.placeholder}
                  />
                )}

                {q.type === 'textarea' && (
                  <TextField
                    textarea
                    value={currentAnswer as string}
                    onChange={(val) => onAnswerChange(q.id, val)}
                    placeholder={q.placeholder}
                  />
                )}

                {q.type === 'single_choice' && q.options && (
                  <ChoiceCardsField
                    options={q.options}
                    value={currentAnswer as string}
                    customText={(answers[`${q.id}_custom`] as string) || ''}
                    onChange={(val) => onAnswerChange(q.id, val)}
                    onCustomTextChange={(text) => onAnswerChange(`${q.id}_custom`, text)}
                  />
                )}

                {q.type === 'multiple_choice' && q.options && (
                  <ChoiceCardsField
                    multiple
                    options={q.options}
                    value={currentAnswer as string[]}
                    customText={(answers[`${q.id}_custom`] as string) || ''}
                    onChange={(val) => onAnswerChange(q.id, val)}
                    onCustomTextChange={(text) => onAnswerChange(`${q.id}_custom`, text)}
                  />
                )}

                {q.type === 'maturity_matrix' && q.maturityItems && (
                  <MaturityMatrixField
                    items={q.maturityItems}
                    value={currentAnswer as any}
                    onChange={(val) => onAnswerChange(q.id, val)}
                  />
                )}

                {q.type === 'boolean' && (
                  <BooleanToggleField
                    value={currentAnswer as boolean}
                    onChange={(val) => onAnswerChange(q.id, val)}
                  />
                )}

                {q.type === 'photo_upload' && (
                  <PhotoUploadField
                    photos={currentAnswer as UploadedPhoto[]}
                    onChange={(photos) => onAnswerChange(q.id, photos)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
