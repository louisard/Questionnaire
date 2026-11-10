/**
 * Types stricts pour le questionnaire de découverte et de cadrage - Traiteur Annie
 */

export type MaturityLevel = 'EXISTING' | 'SHORT_TERM' | 'LONG_TERM' | 'NONE';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'single_choice'
  | 'multiple_choice'
  | 'maturity_matrix'
  | 'number'
  | 'boolean'
  | 'photo_upload';

export type ConditionOperator = 'equals' | 'not_equals' | 'includes' | 'is_not_empty' | 'has_maturity';

export interface ConditionRule {
  questionId: string;
  operator: ConditionOperator;
  value?: string | string[] | boolean | number;
  // Pour tester un item spécifique dans une matrice de maturité
  itemId?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  allowCustomText?: boolean; // Pour afficher un champ de précision libre quand "Autre" est coché
}

export interface MaturityItem {
  id: string;
  label: string;
  category?: string;
  description?: string;
}

export interface QuestionDefinition {
  id: string;
  stepId: number;
  title: string;
  subtitle?: string;
  helpText?: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  options?: ChoiceOption[];
  maturityItems?: MaturityItem[];
  dependsOn?: ConditionRule[];
  minNumber?: number;
  maxNumber?: number;
}

export interface StepDefinition {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName?: string;
  questions: QuestionDefinition[];
}

export interface UploadedPhoto {
  id: string;
  name: string;
  size: number;
  type: string;
  category?: 'image' | 'document';
  dataUrl: string; // Base64 pour persistance, prévisualisation et archivage ZIP
  uploadedAt: string;
}

export type QuestionAnswerValue =
  | string
  | string[]
  | number
  | boolean
  | Record<string, MaturityLevel>
  | UploadedPhoto[];

export interface QuestionnaireAnswers {
  [questionId: string]: QuestionAnswerValue;
}

export interface SyncMetadata {
  sessionId: string;
  version: string;
  lastUpdated: string;
  serverSyncedAt?: string;
  isDirtyLocally: boolean;
  syncError?: string | null;
}

export interface QuestionnaireState {
  version: string;
  sessionId: string;
  currentStepId: number;
  completedStepIds: number[];
  answers: QuestionnaireAnswers;
  lastUpdated: string;
  mode?: 'normal' | 'model'; // Mode normal (réel vierge) vs Mode modèle (fictif indépendant)
}

export interface ExportPayload {
  app: 'Traiteur_Annie_Cadrage';
  version: string;
  exportedAt: string;
  sessionId: string;
  state: QuestionnaireState;
}

export interface CompletenessReport {
  totalQuestions: number;
  visibleQuestionsCount: number;
  answeredCount: number;
  requiredTotalCount: number;
  requiredAnsweredCount: number;
  optionalTotalCount: number;
  optionalAnsweredCount: number;
  percentGlobal: number;
  missingRequired: Array<{ questionId: string; stepId: number; stepTitle: string; title: string }>;
  missingOptional: Array<{ questionId: string; stepId: number; stepTitle: string; title: string }>;
  pointsToClarify: Array<{ questionId: string; stepId: number; title: string; reason: string }>;
  maturityBreakdown: {
    existing: Array<{ questionTitle: string; itemLabel: string }>;
    shortTerm: Array<{ questionTitle: string; itemLabel: string }>;
    longTerm: Array<{ questionTitle: string; itemLabel: string }>;
    none: Array<{ questionTitle: string; itemLabel: string }>;
  };
}
