import { describe, it, expect } from 'vitest';
import { cleanOrphanAnswers, isQuestionVisible } from '../services/conditionEngine';
import { validateStep, validateImportPayload } from '../services/validationService';
import { generateCompletenessAudit } from '../services/completenessAudit';
import { QUESTIONNAIRE_STEPS } from '../config/questionnaireSchema';
import { APP_ID, SCHEMA_VERSION } from '../config/constants';

describe('Condition Engine & Recursive Cleanup (v2)', () => {
  it('should hide equipment details when equipment rental is set to location_non_prevue', () => {
    const step4 = QUESTIONNAIRE_STEPS.find((s) => s.id === 4)!;
    const catalogQuestion = step4.questions.find((q) => q.id === 's4_equipment_catalog_maturity')!;

    // Si location_non_prevue -> masqué
    expect(isQuestionVisible(catalogQuestion, { s4_rental_activity_status: 'location_non_prevue' })).toBe(false);

    // Si location_active -> visible
    expect(isQuestionVisible(catalogQuestion, { s4_rental_activity_status: 'location_active' })).toBe(true);
  });

  it('should recursively clean orphan answers in section 4 when parent answer changes', () => {
    const dirtyAnswers = {
      s4_rental_activity_status: 'location_non_prevue',
      s4_equipment_catalog_maturity: { chaises: 'EXISTING', tables: 'SHORT_TERM' },
      s4_equipment_details: '150 chaises en stock',
      s4_rental_duration_mode: ['weekend'],
      s4_rental_conditions: ['caution_demandee'],
      s4_delivery_modes: 'les_deux',
      s4_setup_installation_service: 'installation_oui',
      s1_brand_name: 'Traiteur Annie Test',
    };

    const cleaned = cleanOrphanAnswers(dirtyAnswers as any);

    expect(cleaned['s1_brand_name']).toBe('Traiteur Annie Test');
    expect(cleaned['s4_rental_activity_status']).toBe('location_non_prevue');
    // Les réponses conditionnelles doivent avoir disparu
    expect(cleaned['s4_equipment_catalog_maturity']).toBeUndefined();
    expect(cleaned['s4_equipment_details']).toBeUndefined();
    expect(cleaned['s4_rental_duration_mode']).toBeUndefined();
    expect(cleaned['s4_rental_conditions']).toBeUndefined();
    expect(cleaned['s4_delivery_modes']).toBeUndefined();
    expect(cleaned['s4_setup_installation_service']).toBeUndefined();
  });
});

describe('Validation Service & Import Payload (v2)', () => {
  it('should invalidate section 1 if required brand name is missing', () => {
    const validation = validateStep(1, {});
    expect(validation.isValid).toBe(false);
    expect(validation.missingQuestionIds).toContain('s1_brand_name');
  });

  it('should validate section 1 when all required fields are filled', () => {
    const validSection1Answers = {
      s1_brand_name: 'Traiteur Annie',
      s1_contact_person: 'Annie K. - 06 12 34 56 78 - contact@traiteur-annie.fr',
      s1_storytelling: 'Passion de la cuisine africaine transmise de génération en génération.',
      s1_location: 'Évry (91), Île-de-France',
      s1_legal_status: 'societe',
      s1_company_personality: ['authentique', 'chaleureuse_familiale'],
    };

    const validation = validateStep(1, validSection1Answers);
    expect(validation.isValid).toBe(true);
    expect(validation.missingQuestionIds).toEqual([]);
  });

  it('should reject invalid import JSON missing correct app identifier', () => {
    const corruptedPayload = {
      app: 'Another_App',
      version: '2.0.0',
      state: {},
    };

    const res = validateImportPayload(corruptedPayload);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Application non compatible');
  });

  it('should accept valid import JSON v2 and filter unknown ghost fields', () => {
    const validPayload = {
      app: APP_ID,
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      sessionId: 'session_test_456',
      state: {
        version: SCHEMA_VERSION,
        sessionId: 'session_test_456',
        currentStepId: 2,
        completedStepIds: [1],
        answers: {
          s1_brand_name: 'Traiteur Annie Importé v2',
          unknown_ghost_field: 'should be removed',
        },
        lastUpdated: new Date().toISOString(),
      },
    };

    const res = validateImportPayload(validPayload);
    expect(res.isValid).toBe(true);
    expect(res.payload?.state.answers['s1_brand_name']).toBe('Traiteur Annie Importé v2');
    expect(res.payload?.state.answers['unknown_ghost_field']).toBeUndefined();
  });
});

describe('Completeness Audit & 4-Level Maturity Breakdown', () => {
  it('should classify maturity items in the 4 strict categories (EXISTING, SHORT_TERM, LONG_TERM, NONE)', () => {
    const answers = {
      s2_african_regions: ['west_africa'],
      s2_culinary_services_maturity: {
        buffets_africains: 'EXISTING',
        cocktails_pieces_salees: 'SHORT_TERM',
        autres_prestations_culinaires: 'LONG_TERM',
        plateaux_repas_b2b: 'NONE',
      },
      s10_photos_ready_status: 'photos_non',
      s10_logo_availability: 'logo_non',
    };

    const audit = generateCompletenessAudit(answers as any);

    expect(audit.maturityBreakdown.existing.some((it) => it.itemLabel.includes('Buffets'))).toBe(true);
    expect(audit.maturityBreakdown.shortTerm.some((it) => it.itemLabel.includes('Cocktails'))).toBe(true);
    expect(audit.maturityBreakdown.longTerm.some((it) => it.itemLabel.includes('Autres prestations'))).toBe(true);
    expect(audit.maturityBreakdown.none.some((it) => it.itemLabel.includes('Plateaux-repas'))).toBe(true);

    // Vérification des alertes de complétude
    expect(audit.pointsToClarify.some((p) => p.questionId === 's10_photos_ready_status')).toBe(true);
    expect(audit.pointsToClarify.some((p) => p.questionId === 's10_logo_availability')).toBe(true);
  });
});
