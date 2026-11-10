import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { QuestionnaireState, CompletenessReport, MaturityLevel } from '../types/questionnaire';
import { QUESTIONNAIRE_STEPS } from '../config/questionnaireSchema';
import { isQuestionVisible } from '../services/conditionEngine';
import { pdfStyles } from './styles/pdfStyles';
import { MATURITY_LABELS } from '../config/constants';

interface CadrageDocumentProps {
  state: QuestionnaireState;
  audit: CompletenessReport;
}

export const CadrageDocument: React.FC<CadrageDocumentProps> = ({ state, audit }) => {
  const brandName = (state.answers['s1_brand_name'] as string) || (state.answers['q1_brand_name'] as string) || 'Traiteur Annie';
  const contactPerson = (state.answers['s1_contact_person'] as string) || (state.answers['q1_contact_person'] as string) || 'Non renseigné';
  const exportDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const renderAnswerText = (val: any, options?: any[]): string => {
    if (val === undefined || val === null || val === '') return 'Non renseigné';
    if (typeof val === 'boolean') return val ? 'Oui' : 'Non';
    if (typeof val === 'string') {
      const match = options?.find((o) => o.id === val);
      return match ? match.label : val;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return 'Aucun sélectionné';
      return val
        .map((id) => {
          const match = options?.find((o) => o.id === id);
          return match ? match.label : id;
        })
        .join(', ');
    }
    return String(val);
  };

  return (
    <Document title={`Cadrage - ${brandName}`} author="Traiteur Annie" creator="M. Ty - Assistant Antigravity">
      {/* ========================================================
          PAGE 1 : COUVERTURE DU DOCUMENT DE CADRAGE
          ======================================================== */}
      <Page size="A4" style={pdfStyles.coverPage}>
        <View>
          <Text style={pdfStyles.coverBadge}>Dossier de Découverte & Spécifications</Text>
          <Text style={pdfStyles.coverTitle}>{brandName}</Text>
          <Text style={pdfStyles.coverSubtitle}>
            Cahier de cadrage pour la conception du futur site internet
          </Text>
          <View style={pdfStyles.coverSeparator} />

          <View style={pdfStyles.coverMetaBlock}>
            <View style={pdfStyles.coverMetaRow}>
              <Text style={pdfStyles.coverMetaLabel}>Activité culinaire :</Text>
              <Text style={pdfStyles.coverMetaValue}>Traiteur Gastronomie Africaine Exclusive</Text>
            </View>
            <View style={pdfStyles.coverMetaRow}>
              <Text style={pdfStyles.coverMetaLabel}>Activité annexe :</Text>
              <Text style={pdfStyles.coverMetaValue}>Location de Matériel de Réception (Hors salle)</Text>
            </View>
            <View style={pdfStyles.coverMetaRow}>
              <Text style={pdfStyles.coverMetaLabel}>Référent projet :</Text>
              <Text style={pdfStyles.coverMetaValue}>{contactPerson}</Text>
            </View>
            <View style={pdfStyles.coverMetaRow}>
              <Text style={pdfStyles.coverMetaLabel}>Date d'édition :</Text>
              <Text style={pdfStyles.coverMetaValue}>{exportDate}</Text>
            </View>
            <View style={pdfStyles.coverMetaRow}>
              <Text style={pdfStyles.coverMetaLabel}>Identifiant de session :</Text>
              <Text style={pdfStyles.coverMetaValue}>{state.sessionId}</Text>
            </View>
            <View style={pdfStyles.coverMetaRow}>
              <Text style={pdfStyles.coverMetaLabel}>Taux de complétude :</Text>
              <Text style={pdfStyles.coverMetaValue}>
                {audit.percentGlobal}% ({audit.answeredCount} questions renseignées sur {audit.visibleQuestionsCount})
              </Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.coverFooter}>
          <Text>Document contractuel de cadrage technique et fonctionnel</Text>
          <Text>Confidentiel — Usage interne</Text>
        </View>
      </Page>

      {/* ========================================================
          PAGE 2 : SYNTHÈSE DES BESOINS & MATRICE DE MATURITÉ
          ======================================================== */}
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerTitle}>Traiteur Annie — Synthèse Stratégique</Text>
          <Text>{exportDate}</Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>1. Matrice de Maturité des Prestations</Text>
        <Text style={{ fontSize: 9, color: '#57534e', marginBottom: 8 }}>
          Positionnement des fonctionnalités et services selon 4 niveaux : Existant, Court terme, Long terme et Non prévu.
        </Text>

        {/* Tableau 4 Niveaux */}
        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
            <Text style={{ flex: 1.5, fontFamily: 'Helvetica-Bold' }}>Prestation / Service</Text>
            <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold' }}>Niveau</Text>
            <Text style={{ flex: 2, fontFamily: 'Helvetica-Bold' }}>Thématique</Text>
          </View>

          {/* Items existants */}
          {audit.maturityBreakdown.existing.map((item, i) => (
            <View key={`ex-${i}`} style={pdfStyles.tableRow}>
              <Text style={{ flex: 1.5, fontSize: 8.5 }}>{item.itemLabel}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[pdfStyles.badge, pdfStyles.badgeExisting]}>Existant</Text>
              </View>
              <Text style={{ flex: 2, fontSize: 8, color: '#78716c' }}>{item.questionTitle}</Text>
            </View>
          ))}

          {/* Items court terme */}
          {audit.maturityBreakdown.shortTerm.map((item, i) => (
            <View key={`st-${i}`} style={pdfStyles.tableRow}>
              <Text style={{ flex: 1.5, fontSize: 8.5 }}>{item.itemLabel}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[pdfStyles.badge, pdfStyles.badgeShortTerm]}>Court terme</Text>
              </View>
              <Text style={{ flex: 2, fontSize: 8, color: '#78716c' }}>{item.questionTitle}</Text>
            </View>
          ))}

          {/* Items long terme */}
          {audit.maturityBreakdown.longTerm.map((item, i) => (
            <View key={`lt-${i}`} style={pdfStyles.tableRow}>
              <Text style={{ flex: 1.5, fontSize: 8.5 }}>{item.itemLabel}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[pdfStyles.badge, pdfStyles.badgeLongTerm]}>Long terme</Text>
              </View>
              <Text style={{ flex: 2, fontSize: 8, color: '#78716c' }}>{item.questionTitle}</Text>
            </View>
          ))}

          {/* Items non prévus (4e niveau strict) */}
          {audit.maturityBreakdown.none.map((item, i) => (
            <View key={`none-${i}`} style={pdfStyles.tableRow}>
              <Text style={{ flex: 1.5, fontSize: 8.5 }}>{item.itemLabel}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[pdfStyles.badge, pdfStyles.badgeNone]}>Non prévu</Text>
              </View>
              <Text style={{ flex: 2, fontSize: 8, color: '#78716c' }}>{item.questionTitle}</Text>
            </View>
          ))}
        </View>

        {/* Points à clarifier & manquants */}
        {audit.pointsToClarify.length > 0 && (
          <View style={pdfStyles.alertBox}>
            <Text style={pdfStyles.alertTitle}>Points de vigilance et clarifications nécessaires :</Text>
            {audit.pointsToClarify.map((pt, idx) => (
              <Text key={idx} style={pdfStyles.alertItem}>
                • <Text style={{ fontFamily: 'Helvetica-Bold' }}>{pt.title} :</Text> {pt.reason}
              </Text>
            ))}
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text>{brandName} — Document de Cadrage</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* ========================================================
          PAGES DÉTAILLÉES : RÉPONSES AUX 7 ÉTAPES
          ======================================================== */}
      {QUESTIONNAIRE_STEPS.map((step) => {
        const visibleQuestions = step.questions.filter((q) => isQuestionVisible(q, state.answers));

        return (
          <Page key={step.id} size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
              <Text style={pdfStyles.headerTitle}>
                {brandName} — Étape {step.id} : {step.shortTitle}
              </Text>
              <Text>{exportDate}</Text>
            </View>

            <Text style={pdfStyles.sectionTitle}>
              Étape {step.id}. {step.title}
            </Text>
            <Text style={{ fontSize: 8.5, color: '#78716c', marginBottom: 12 }}>
              {step.description}
            </Text>

            {visibleQuestions.map((q) => {
              const rawAnswer = state.answers[q.id];

              if (q.type === 'maturity_matrix') {
                const matrix = (rawAnswer as Record<string, MaturityLevel>) || {};
                return (
                  <View key={q.id} style={pdfStyles.questionBlock}>
                    <Text style={pdfStyles.questionTitle}>{q.title}</Text>
                    {q.maturityItems?.map((it) => {
                      const lvl = matrix[it.id] || 'NONE';
                      const badgeStyle =
                        lvl === 'EXISTING'
                          ? pdfStyles.badgeExisting
                          : lvl === 'SHORT_TERM'
                          ? pdfStyles.badgeShortTerm
                          : lvl === 'LONG_TERM'
                          ? pdfStyles.badgeLongTerm
                          : pdfStyles.badgeNone;

                      return (
                        <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                          <Text style={[pdfStyles.badge, badgeStyle]}>
                            {MATURITY_LABELS[lvl]?.short || 'Non prévu'}
                          </Text>
                          <Text style={{ fontSize: 9, color: '#292524' }}>{it.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              }

              return (
                <View key={q.id} style={pdfStyles.questionBlock}>
                  <Text style={pdfStyles.questionTitle}>
                    {q.title} {q.required ? '*' : ''}
                  </Text>
                  <Text style={rawAnswer ? pdfStyles.questionAnswer : pdfStyles.unansweredText}>
                    {renderAnswerText(rawAnswer, q.options)}
                  </Text>
                </View>
              );
            })}

            <View style={pdfStyles.footer} fixed>
              <Text>{brandName} — Document de Cadrage</Text>
              <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
