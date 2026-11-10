/**
 * Jeu de données de démonstration et de cadrage pour Traiteur Annie
 * Renseigne toutes les questions de la Section 1 à la Section 10
 * SAUF la toute dernière question (s10_final_words) laissée vide pour le test utilisateur.
 */
import { QuestionnaireAnswers } from '../types/questionnaire';

export const DEMO_PREFILLED_ANSWERS: QuestionnaireAnswers = {
  // SECTION 1 — Identité et positionnement
  s1_brand_name: "Traiteur Annie - Saveurs & Réceptions d'Afrique",
  s1_contact_person: "Annie KOUASSI - 06 45 78 12 90 - contact@traiteur-annie.fr",
  s1_storytelling: "Cuisinière passionnée originaire de Côte d'Ivoire et passionnée par les terroirs sénégalais et camerounais, j'ai appris la cuisine auprès de ma mère et de mes tantes. Après avoir régalé les mariages de mes proches pendant plus de 10 ans, j'ai créé Traiteur Annie pour offrir une gastronomie africaine authentique, élégante et festive.",
  s1_location: "Basée à Ris-Orangis / Évry (91), j'interviens dans toute l'Île-de-France (75, 91, 92, 93, 94, 77, 78, 95) et départements limitrophes sur demande.",
  s1_legal_status: "societe",
  s1_company_personality: ["authentique", "chaleureuse_familiale", "moderne", "haut_de_gamme"],
  s1_differentiators: "Des cuissons mijotées traditionnelles sans compromis, des dressages soignés et colorés, des viandes d'une tendreté absolue et une équipe souriante habillée avec une touche de wax raffinée.",

  // SECTION 2 — Offre traiteur et cuisine africaine
  s2_african_regions: ["west_africa", "central_africa", "multi_regions"],
  s2_culinary_services_maturity: {
    plats_a_la_commande: "EXISTING",
    buffets_africains: "EXISTING",
    menus_evenements: "EXISTING",
    cocktails_pieces_salees: "EXISTING",
    plateaux_repas_b2b: "SHORT_TERM",
    autres_prestations_culinaires: "LONG_TERM",
    repas_individuels: "NONE",
  },
  s2_signature_dishes: "1. Thieboudienne Penda Mbaye royale (riz rouge sénégalais au mérou blanc et légumes fondants)\n2. Poulet Yassa braisé mariné 24h aux oignons caramélisés et citron vert\n3. Ndolé camerounais aux crevettes fraîches et bœuf fumé avec bâtons de manioc\n4. Pastels dorés au thon et à la viande hachée avec sauce tomate épicée maison.",
  s2_side_dishes: [
    "alloco",
    "attieke",
    "riz_blanc_parfume_rouge",
    "banane_plantain_vapeur",
    "manioc_igname_foutou",
  ],
  s2_desserts_status: "desserts_oui",
  s2_beverages_offer: ["jus_naturels_africains", "boissons_classiques"],
  s2_dietary_adaptations: ["vegetarien", "sans_gluten", "niveau_piment"],
  s2_halal_policy: "tous_halal",
  s2_pricing_method: ["prix_par_personne", "devis_personnalise"],
  s2_menu_document_status: "oui_a_actualiser",

  // SECTION 3 — Clients et événements
  s3_target_clients: ["particuliers", "entreprises", "associations", "organisateurs"],
  s3_event_types: ["mariages", "anniversaires", "baptemes_communions", "receptions_familiales", "evenements_pros"],
  s3_current_capacity: "100_a_200",
  s3_target_capacity: "Atteindre 400 à 500 convives sur les très grands mariages avec une brigade renforcée.",
  s3_tasting_sessions: "degustation_oui",
  s3_order_frequency: "hebdomadaire",

  // SECTION 4 — Location de matériel de réception
  s4_rental_activity_status: "location_active",
  s4_equipment_catalog_maturity: {
    chaises: "EXISTING",
    tables: "EXISTING",
    nappes_housses: "EXISTING",
    materiel_buffet_chafing: "EXISTING",
    assiettes_vaisselle: "EXISTING",
    couverts: "EXISTING",
    verres_coupes: "EXISTING",
    decoration_accessoires: "SHORT_TERM",
    autres_equipements: "NONE",
  },
  s4_equipment_details: "Parc actuel : 180 chaises Napoléon blanches avec assises blanches, 18 tables rondes 8/10 personnes, 10 mange-debout houssés, 12 chafing dishes inox 9L avec brûleurs, vaisselle complète liseré doré pour 200 convives.",
  s4_rental_duration_mode: ["weekend", "journee"],
  s4_rental_conditions: ["caution_demandee", "piece_identite", "contrat_location", "frais_casse_perte"],
  s4_delivery_modes: "les_deux",
  s4_setup_installation_service: "installation_oui",

  // SECTION 5 — Offres combinées
  s5_combined_order_allowed: "oui_combinaison",
  s5_combined_packages_interest: "pack_oui_actuel",
  s5_combined_formula_types: [
    "formule_cle_en_main",
    "repas_vaisselle",
    "repas_tables_chaises",
    "buffet_materiel_presentation",
  ],
  s5_preferential_rates: "remise_oui",
  s5_website_presentation_mode: "une_entreprise_deux_rubriques",

  // SECTION 6 — Zone géographique et logistique
  s6_current_coverage_zone: ["ville_departement_depart", "departements_voisins", "toute_idf"],
  s6_future_coverage_zone: "Rayon étendu à 150 km autour de Paris (Oise, Eure-et-Loir, Loiret) pour les grands événements.",
  s6_food_collection_mode: "livraison_et_retrait",
  s6_equipment_delivery_org: ["livraison_par_entreprise", "retrait_par_client"],
  s6_travel_fees_policy: "selon_distance",
  s6_logistic_constraints: ["capacite_transport", "stockage", "dispo_personnel"],

  // SECTION 7 — Commandes, réservations et devis
  s7_current_contact_channels: ["whatsapp", "telephone", "reseaux_sociaux", "bouche_a_oreille"],
  s7_preferred_website_channel: "plusieurs_canaux",
  s7_order_management_vision: "demande_devis_en_ligne",
  s7_minimum_notice_time: "une_semaine",
  s7_payment_methods: ["virement_bancaire", "carte_bancaire", "especes"],
  s7_deposit_policy: "acompte_systematique",
  s7_quote_required_fields: [
    "coordonnees_nom_tel_email",
    "date_evenement",
    "type_evenement",
    "nombre_personnes",
    "prestations_souhaitees",
    "lieu_livraison",
    "budget_indicatif",
  ],

  // SECTION 8 — Informations pratiques et confiance
  s8_opening_hours: "Du mardi au samedi de 9h à 19h30. Joignable 7j/7 par WhatsApp.",
  s8_blackout_periods: "Pas de fermeture estivale (pleine saison des mariages). Deux semaines de congés annuels mi-janvier.",
  s8_customer_testimonials_status: "avis_oui_disponibles",
  s8_trust_elements: ["photos_realisations", "avis_clients", "presentation_entreprise", "documents_pros"],
  s8_faq_display_preference: "faq_oui",
  s8_special_terms_notice: "Acompte de 40% à la réservation pour bloquer la date. Nombre définitif de convives à confirmer 10 jours avant l'événement.",

  // SECTION 9 — Vision et évolution
  s9_goals_12_months: "Signer 20 grands mariages africains, développer l'offre plateaux-repas en entreprise et investir dans 100 chaises supplémentaires.",
  s9_vision_3_5_years: "Devenir le traiteur de référence pour les réceptions africaines haut de gamme en Île-de-France avec un atelier professionnel et 2 camionnettes dédiées.",
  s9_develop_new_dishes: "oui_nouvelles_cartes",
  s9_develop_rental_park: "oui_fort_developpement_materiel",
  s9_partnerships_interest: "partenariats_oui",
  s9_online_booking_system_vision: "systeme_en_ligne_oui",
  s9_extra_features_wished: "Un simulateur de budget indicatif direct pour les futurs mariés afin de leur donner une idée de prix avant d'envoyer le devis.",
  s9_final_words: "Partageons la richesse et la convivialité de nos terroirs africains !",

  // SECTION 10 — Identité visuelle, photos et documents
  s10_logo_availability: "logo_oui",
  s10_graphic_colors: "Or chaud, Terracotta africain, Vert émeraude profond et Blanc cassé.",
  s10_brand_ambiance: ["africaine_traditionnelle", "chic_haut_de_gamme", "familiale_chaleureuse"],
  s10_social_platforms: ["instagram", "whatsapp_business", "tiktok", "facebook"],
  s10_domain_name_status: "domaine_oui",
  s10_google_profile_status: "gmb_oui",
  s10_photos_ready_status: "photos_oui",
  // ATTENTION : s10_uploaded_photos est prête pour tes propres téléversements ou le test de l'archive !
};
