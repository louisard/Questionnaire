import { QuestionnaireState, CompletenessReport, MaturityLevel, UploadedPhoto } from '../types/questionnaire';
import { QUESTIONNAIRE_STEPS } from '../config/questionnaireSchema';
import { isQuestionVisible } from './conditionEngine';
import { MATURITY_LABELS } from '../config/constants';
import JSZip from 'jszip';

/**
 * Génère le document complet de synthèse au format Markdown (.md)
 * Respecte l'organisation des sections, les commentaires libres ("Autre"),
 * la matrice de maturité sur 4 niveaux, l'inventaire des photos et les alertes.
 */
export function generateMarkdownSynthesis(
  state: QuestionnaireState,
  audit: CompletenessReport
): string {
  const brandName = (state.answers['s1_brand_name'] as string) || 'Traiteur Annie';
  const contactPerson = (state.answers['s1_contact_person'] as string) || 'Non renseigné';
  const exportDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];

  // En-tête officiel
  lines.push(`# CAHIER DE DÉCOUVERTE ET DE CADRAGE DU FUTUR SITE INTERNET`);
  lines.push(`## Entreprise : ${brandName}`);
  lines.push(``);
  lines.push(`> **Document officiel de synthèse pour la conception du site internet vitrine.**`);
  lines.push(`> Ce document recense l'intégralité des informations recueillies auprès de l'entreprise, son offre, ses contraintes logistiques, ses choix graphiques et ses ambitions d'évolution.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Fiche d'Identité & Métadonnées`);
  lines.push(`- **Nom commercial :** ${brandName}`);
  lines.push(`- **Référente du projet :** ${contactPerson}`);
  lines.push(`- **Activités :** Traiteur Cuisine Africaine Exclusive & Location de Matériel de Réception (Hors salle)`);
  lines.push(`- **Date d'exportation :** ${exportDate}`);
  lines.push(`- **Identifiant de session :** \`${state.sessionId}\``);
  lines.push(`- **Version du modèle :** v${state.version}`);
  lines.push(`- **Taux de complétude globale :** **${audit.percentGlobal}%** (${audit.answeredCount} questions renseignées sur ${audit.visibleQuestionsCount} visibles)`);
  lines.push(``);

  // Section Matrice de Maturité
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 1. MATRICE DE MATURITÉ DES PRESTATIONS ET ÉQUIPEMENTS`);
  lines.push(``);
  lines.push(`Chaque prestation culinaire ou catégorie d'équipement est catégorisée selon son niveau réel de maturité :`);
  lines.push(``);

  lines.push(`### 🟢 1.1 Existant aujourd'hui (${audit.maturityBreakdown.existing.length})`);
  if (audit.maturityBreakdown.existing.length === 0) {
    lines.push(`*Aucun élément déclaré comme existant actuellement.*`);
  } else {
    audit.maturityBreakdown.existing.forEach((item) => {
      lines.push(`- **${item.itemLabel}** *(Rubrique : ${item.questionTitle})*`);
    });
  }
  lines.push(``);

  lines.push(`### 🟠 1.2 Souhaité à court terme (${audit.maturityBreakdown.shortTerm.length})`);
  if (audit.maturityBreakdown.shortTerm.length === 0) {
    lines.push(`*Aucun élément prévu à court terme.*`);
  } else {
    audit.maturityBreakdown.shortTerm.forEach((item) => {
      lines.push(`- **${item.itemLabel}** *(Rubrique : ${item.questionTitle})*`);
    });
  }
  lines.push(``);

  lines.push(`### 🔵 1.3 Envisagé à long terme (${audit.maturityBreakdown.longTerm.length})`);
  if (audit.maturityBreakdown.longTerm.length === 0) {
    lines.push(`*Aucun élément envisagé à long terme.*`);
  } else {
    audit.maturityBreakdown.longTerm.forEach((item) => {
      lines.push(`- **${item.itemLabel}** *(Rubrique : ${item.questionTitle})*`);
    });
  }
  lines.push(``);

  lines.push(`### ⚪ 1.4 Non prévu / Hors périmètre (${audit.maturityBreakdown.none.length})`);
  if (audit.maturityBreakdown.none.length === 0) {
    lines.push(`*Aucun élément exclu.*`);
  } else {
    audit.maturityBreakdown.none.forEach((item) => {
      lines.push(`- **${item.itemLabel}** *(Rubrique : ${item.questionTitle})*`);
    });
  }
  lines.push(``);

  // Section Points d'attention et complétude
  if (audit.missingRequired.length > 0 || audit.pointsToClarify.length > 0) {
    lines.push(`---`);
    lines.push(``);
    lines.push(`## 2. AUDIT DE COMPLÉTUDE & POINTS DE VIGILANCE`);
    lines.push(``);

    if (audit.missingRequired.length > 0) {
      lines.push(`### ⚠️ Questions obligatoires restant à renseigner :`);
      audit.missingRequired.forEach((req) => {
        lines.push(`- [ ] **[${req.stepTitle}]** ${req.title}`);
      });
      lines.push(``);
    }

    if (audit.pointsToClarify.length > 0) {
      lines.push(`### 💡 Clarifications et recommandations pour le futur site :`);
      audit.pointsToClarify.forEach((pt) => {
        lines.push(`- **${pt.title} :** ${pt.reason}`);
      });
      lines.push(``);
    }
  }

  // Détail par section thématique
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 3. RÉPONSES DÉTAILLÉES PAR THÉMATIQUE`);
  lines.push(``);

  QUESTIONNAIRE_STEPS.forEach((step) => {
    const visibleQuestions = step.questions.filter((q) => isQuestionVisible(q, state.answers));
    if (visibleQuestions.length === 0) return;

    lines.push(`### SECTION ${step.id} — ${step.title.toUpperCase()}`);
    lines.push(`*${step.description}*`);
    lines.push(``);

    visibleQuestions.forEach((q) => {
      const rawAnswer = state.answers[q.id];
      const customComment = state.answers[`${q.id}_custom`] as string | undefined;

      lines.push(`#### ${q.title} ${q.required ? '*(Obligatoire)*' : '*(Facultatif)*'}`);
      if (q.subtitle) {
        lines.push(`> ${q.subtitle}`);
      }

      if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
        lines.push(`*Non renseigné*`);
      } else if (q.type === 'photo_upload') {
        const files = (rawAnswer as UploadedPhoto[]) || [];
        if (files.length === 0) {
          lines.push(`*Aucun fichier (photo ou document) transmis dans cette session.*`);
        } else {
          lines.push(`**${files.length} fichier(s) (photos & documents) transmis pour le site :**`);
          files.forEach((fi, i) => {
            const kind = fi.category === 'document' || !fi.type.startsWith('image/') ? 'Document' : 'Photo';
            lines.push(`  ${i + 1}. [${kind}] \`${fi.name}\` (${(fi.size / 1024).toFixed(1)} Ko - importé le ${new Date(fi.uploadedAt).toLocaleDateString('fr-FR')})`);
          });
        }
      } else if (q.type === 'maturity_matrix') {
        const matrix = (rawAnswer as Record<string, MaturityLevel>) || {};
        lines.push(`| Élément / Prestation | Statut de maturité |`);
        lines.push(`| :--- | :--- |`);
        q.maturityItems?.forEach((it) => {
          const lvl = matrix[it.id] || 'NONE';
          lines.push(`| **${it.label}** | ${MATURITY_LABELS[lvl]?.label || 'Non prévu'} |`);
        });
      } else if (q.type === 'boolean') {
        lines.push(`**Réponse :** ${rawAnswer ? 'Oui' : 'Non'}`);
      } else if (q.type === 'single_choice') {
        const match = q.options?.find((o) => o.id === rawAnswer);
        const label = match ? match.label : String(rawAnswer);
        lines.push(`**Réponse :** ${label}`);
        if (customComment) {
          lines.push(`> 📝 **Précision renseignée :** ${customComment}`);
        }
      } else if (q.type === 'multiple_choice') {
        const arr = (rawAnswer as string[]) || [];
        if (arr.length === 0) {
          lines.push(`*Aucun élément sélectionné*`);
        } else {
          arr.forEach((id) => {
            const match = q.options?.find((o) => o.id === id);
            const label = match ? match.label : id;
            lines.push(`- ${label}`);
          });
        }
        if (customComment) {
          lines.push(`> 📝 **Précision renseignée pour "Autre" :** ${customComment}`);
        }
      } else {
        // text ou textarea
        lines.push(`${rawAnswer}`);
      }

      lines.push(``);
    });

    lines.push(``);
  });

  return lines.join('\n');
}

/**
 * Génère l'archive ZIP contenant toutes les photos originales renommées
 */
export async function generatePhotosZip(state: QuestionnaireState): Promise<Blob> {
  const zip = new JSZip();
  const photos = (state.answers['s8_uploaded_photos'] as UploadedPhoto[]) || [];

  for (const photo of photos) {
    if (photo.dataUrl) {
      // Extraction de la charge binaire base64
      const base64Data = photo.dataUrl.split(',')[1] || photo.dataUrl;
      zip.file(photo.name, base64Data, { base64: true });
    }
  }

  // Fichier récapitulatif dans le zip si aucune photo ou en guise de manifeste
  if (photos.length === 0) {
    zip.file('README.txt', 'Aucune photo n\'a été importée lors de cette session de cadrage.');
  } else {
    const manifest = photos.map((p, i) => `${i + 1}. ${p.name} (${(p.size / 1024).toFixed(1)} Ko)`).join('\n');
    zip.file('INVENTAIRE_PHOTOS.txt', `Traiteur Annie - Photos transmises (${photos.length})\n\n${manifest}`);
  }

  return await zip.generateAsync({ type: 'blob' });
}
