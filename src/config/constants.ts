/**
 * Constantes globales de l'application de cadrage Traiteur Annie
 */

export const APP_ID = 'Traiteur_Annie_Cadrage';
export const SCHEMA_VERSION = '2.0.0';

export const STORAGE_KEYS = {
  STATE: 'traiteur_annie_cadrage_state_v2',
  STATE_NORMAL: 'traiteur_annie_cadrage_state_normal_v2',
  STATE_MODEL: 'traiteur_annie_cadrage_state_model_v2',
  ACTIVE_MODE: 'traiteur_annie_cadrage_active_mode_v2',
  SESSION_ID: 'traiteur_annie_cadrage_session_id',
  SYNC_METADATA: 'traiteur_annie_cadrage_sync_meta_v2',
  OFFLINE_QUEUE: 'traiteur_annie_cadrage_offline_queue_v2',
};

// URL de l'API PocketBase locale ou distante (configurable via variable d'environnement Vite)
export const POCKETBASE_DEFAULT_URL =
  (import.meta.env.VITE_POCKETBASE_URL as string) || 'http://127.0.0.1:8090';

export const POCKETBASE_COLLECTION = 'cadrage_sessions';

export const MATURITY_LABELS: Record<string, { label: string; short: string; color: string; badgeClass: string }> = {
  EXISTING: {
    label: 'Existant aujourd\'hui',
    short: 'Existant',
    color: '#059669', // Emerald
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  SHORT_TERM: {
    label: 'Souhaité à court terme',
    short: 'Court terme',
    color: '#d97706', // Amber
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  LONG_TERM: {
    label: 'Envisagé à long terme',
    short: 'Long terme',
    color: '#2563eb', // Blue
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  NONE: {
    label: 'Non prévu / Hors périmètre',
    short: 'Non prévu',
    color: '#6b7280', // Gray
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
  },
};
