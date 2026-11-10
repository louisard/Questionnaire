import PocketBase from 'pocketbase';
import { QuestionnaireState, SyncMetadata, ExportPayload } from '../types/questionnaire';
import {
  STORAGE_KEYS,
  SCHEMA_VERSION,
  POCKETBASE_DEFAULT_URL,
  POCKETBASE_COLLECTION,
  APP_ID,
} from '../config/constants';
import { DEMO_PREFILLED_ANSWERS } from '../config/demoAnswers';

class PersistenceManager {
  private pb: PocketBase;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncListeners: Array<(meta: SyncMetadata) => void> = [];

  constructor() {
    this.pb = new PocketBase(POCKETBASE_DEFAULT_URL);
    this.pb.autoCancellation(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.updateSyncMetadata({
          syncError: 'Mode hors-ligne : données conservées localement en attente de réseau.',
        });
      });
    }
  }

  public getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }
    return sessionId;
  }

  public setSessionId(newSessionId: string): void {
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
  }

  public getActiveMode(): 'normal' | 'model' {
    const mode = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODE);
    return mode === 'model' ? 'model' : 'normal';
  }

  public setActiveMode(mode: 'normal' | 'model'): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
  }

  private getStorageKeyForMode(mode: 'normal' | 'model'): string {
    return mode === 'model' ? STORAGE_KEYS.STATE_MODEL : STORAGE_KEYS.STATE_NORMAL;
  }

  /**
   * Charge l'état selon le mode actif ('normal' pour données réelles vierges, 'model' pour modèle prérempli)
   */
  public loadLocalState(): QuestionnaireState {
    const mode = this.getActiveMode();
    const sessionId = this.getOrCreateSessionId();
    const key = this.getStorageKeyForMode(mode);
    const raw = localStorage.getItem(key);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            version: SCHEMA_VERSION,
            sessionId: parsed.sessionId || sessionId,
            currentStepId: parsed.currentStepId || 1,
            completedStepIds: Array.isArray(parsed.completedStepIds) ? parsed.completedStepIds : [],
            answers: parsed.answers || {},
            lastUpdated: parsed.lastUpdated || new Date().toISOString(),
            mode,
          };
        }
      } catch (err) {
        console.warn(`Impossible de lire l'état ${mode} corrompu. Réinitialisation.`, err);
      }
    }

    if (mode === 'model') {
      // Modèle prérempli avec exemples fictifs mais réalistes
      const modelState: QuestionnaireState = {
        version: SCHEMA_VERSION,
        sessionId: 'model_' + sessionId,
        currentStepId: 1,
        completedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        answers: { ...DEMO_PREFILLED_ANSWERS },
        lastUpdated: new Date().toISOString(),
        mode: 'model',
      };
      this.saveToLocal(modelState);
      return modelState;
    }

    // Formulaire Normal : initialement vierge, aucun exemple prérempli
    const freshNormal: QuestionnaireState = {
      version: SCHEMA_VERSION,
      sessionId,
      currentStepId: 1,
      completedStepIds: [],
      answers: {},
      lastUpdated: new Date().toISOString(),
      mode: 'normal',
    };
    this.saveToLocal(freshNormal);
    return freshNormal;
  }

  /**
   * Sauvegarde immédiate dans le cache local selon le mode (indépendance stricte)
   */
  public saveToLocal(state: QuestionnaireState): void {
    try {
      const mode = state.mode || this.getActiveMode();
      const key = this.getStorageKeyForMode(mode);
      localStorage.setItem(key, JSON.stringify(state));
      // Maintien rétro-compatible
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
    } catch (err) {
      console.error('Erreur écriture localStorage:', err);
    }
  }

  /**
   * Bascule entre Mode Normal et Mode Modèle sans jamais écraser l'autre
   */
  public switchMode(targetMode: 'normal' | 'model'): QuestionnaireState {
    this.setActiveMode(targetMode);
    return this.loadLocalState();
  }

  public async syncWithServer(state: QuestionnaireState): Promise<SyncMetadata> {
    const meta: SyncMetadata = {
      sessionId: state.sessionId,
      version: state.version,
      lastUpdated: state.lastUpdated,
      isDirtyLocally: false,
      syncError: null,
    };

    this.saveToLocal(state);

    if (!this.isOnline || !navigator.onLine) {
      this.enqueueOfflineUpdate(state);
      meta.isDirtyLocally = true;
      meta.syncError = 'Hors connexion : enregistré localement.';
      this.notifySync(meta);
      return meta;
    }

    try {
      const recordData = {
        session_id: state.sessionId,
        version: state.version,
        current_step: state.currentStepId,
        completed_steps: state.completedStepIds,
        answers: state.answers,
        client_updated_at: state.lastUpdated,
        mode: state.mode || 'normal',
      };

      const existing = await this.pb
        .collection(POCKETBASE_COLLECTION)
        .getFirstListItem(`session_id="${state.sessionId}"`)
        .catch(() => null);

      if (existing) {
        await this.pb.collection(POCKETBASE_COLLECTION).update(existing.id, recordData);
      } else {
        await this.pb.collection(POCKETBASE_COLLECTION).create(recordData);
      }

      meta.serverSyncedAt = new Date().toISOString();
      meta.isDirtyLocally = false;
      meta.syncError = null;
    } catch (err: any) {
      this.enqueueOfflineUpdate(state);
      meta.isDirtyLocally = true;
      meta.syncError = 'Sauvegarde locale active (serveur distant non connecté).';
    }

    this.notifySync(meta);
    return meta;
  }

  public async fetchRemoteSession(sessionId: string): Promise<QuestionnaireState | null> {
    try {
      const record = await this.pb
        .collection(POCKETBASE_COLLECTION)
        .getFirstListItem(`session_id="${sessionId}"`);

      if (record) {
        return {
          version: record.version || SCHEMA_VERSION,
          sessionId: record.session_id,
          currentStepId: record.current_step || 1,
          completedStepIds: record.completed_steps || [],
          answers: record.answers || {},
          lastUpdated: record.client_updated_at || new Date().toISOString(),
          mode: record.mode || 'normal',
        };
      }
    } catch {}
    return null;
  }

  private async processOfflineQueue(): Promise<void> {
    const rawQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!rawQueue) return;

    try {
      const pendingState = JSON.parse(rawQueue) as QuestionnaireState;
      if (pendingState) {
        await this.syncWithServer(pendingState);
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    }
  }

  private enqueueOfflineUpdate(state: QuestionnaireState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }

  public subscribeToSync(callback: (meta: SyncMetadata) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== callback);
    };
  }

  private notifySync(meta: SyncMetadata): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_METADATA, JSON.stringify(meta));
    for (const listener of this.syncListeners) {
      listener(meta);
    }
  }

  private updateSyncMetadata(partial: Partial<SyncMetadata>): void {
    const current = this.getSyncMetadata();
    const updated: SyncMetadata = { ...current, ...partial };
    this.notifySync(updated);
  }

  public getSyncMetadata(): SyncMetadata {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_METADATA);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      sessionId: this.getOrCreateSessionId(),
      version: SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
      isDirtyLocally: false,
      syncError: null,
    };
  }

  public generateExportPayload(state: QuestionnaireState): ExportPayload {
    return {
      app: APP_ID,
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      sessionId: state.sessionId,
      state,
    };
  }

  public resetSession(): QuestionnaireState {
    const mode = this.getActiveMode();
    const newSessionId = 'session_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    const key = this.getStorageKeyForMode(mode);
    localStorage.removeItem(key);

    const freshState: QuestionnaireState = {
      version: SCHEMA_VERSION,
      sessionId: newSessionId,
      currentStepId: 1,
      completedStepIds: [],
      answers: mode === 'model' ? { ...DEMO_PREFILLED_ANSWERS } : {},
      lastUpdated: new Date().toISOString(),
      mode,
    };

    this.saveToLocal(freshState);
    return freshState;
  }
}

export const persistenceManager = new PersistenceManager();
