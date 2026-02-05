
import { supabase } from './supabaseClient';
import { DailyLog, TraceabilityRecord, InventoryItem, StockMovement } from '../types';

// Stockage Local de secours
const localStore = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val))
};

export const db = {
  isCloudEnabled() {
    return !!supabase;
  },

  // --- JOURNAL QUOTIDIEN ---
  async getDailyLogs(): Promise<DailyLog[]> {
    if (!supabase) {
      console.warn("Database: Supabase non initialisé, chargement LocalStorage.");
      return localStore.get('haccp_logs');
    }
    
    try {
      const { data, error } = await supabase
        .from('haccp_logs')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map(row => ({ ...row.data, id: row.id, date: row.date }));
    } catch (error: any) {
      console.error("Erreur critique Cloud (Logs):", error.message);
      return localStore.get('haccp_logs');
    }
  },

  async upsertDailyLog(log: DailyLog) {
    // Sauvegarde locale d'abord
    const logs = await this.getDailyLogs();
    const index = logs.findIndex(l => l.date === log.date);
    if (index > -1) logs[index] = log;
    else logs.unshift(log);
    localStore.set('haccp_logs', logs);

    if (!supabase) return;

    try {
      const { error } = await supabase.from('haccp_logs').upsert({ 
        id: log.id, 
        date: log.date, 
        data: log 
      }, { onConflict: 'date' }); // On force le conflit sur la date
      
      if (error) {
        // Si l'erreur est "relation does not exist", c'est que le script SQL n'a pas tourné
        if (error.code === '42P01') {
          console.error("🚨 La table haccp_logs n'existe pas dans Supabase. Lancez le script SQL !");
        } else {
          throw error;
        }
      }
    } catch (e: any) {
      console.error("Échec synchro Cloud:", e.message);
    }
  },

  // --- TRAÇABILITÉ ---
  async getTraceability(): Promise<TraceabilityRecord[]> {
    if (!supabase) return localStore.get('haccp_traceability');
    try {
      const { data, error } = await supabase.from('haccp_traceability').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e: any) {
      return localStore.get('haccp_traceability');
    }
  },

  async addTraceabilityRecord(record: TraceabilityRecord) {
    const records = await this.getTraceability();
    localStore.set('haccp_traceability', [record, ...records]);

    if (!supabase) return;
    const { error } = await supabase.from('haccp_traceability').insert(record);
    if (error && error.code === '42P01') {
       console.error("🚨 La table haccp_traceability n'existe pas.");
    }
  },

  async deleteTraceabilityRecord(id: string) {
    const records = await this.getTraceability();
    localStore.set('haccp_traceability', records.filter((r: any) => r.id !== id));

    if (!supabase) return;
    await supabase.from('haccp_traceability').delete().eq('id', id);
  },

  async uploadPhoto(file: File): Promise<string | null> {
    if (!supabase) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    
    try {
      const fileName = `trace-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage.from('traceability-photos').upload(fileName, file);
      
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('traceability-photos').getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (e: any) {
      console.error("Erreur Storage:", e.message);
      // Fallback base64 si le storage est mal configuré
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  },

  // --- INVENTAIRE ---
  async getInventory(): Promise<InventoryItem[]> {
    if (!supabase) return localStore.get('haccp_inventory');
    try {
      const { data, error } = await supabase.from('haccp_inventory').select('*');
      if (error) throw error;
      return data;
    } catch (e: any) {
      return localStore.get('haccp_inventory');
    }
  },

  async updateInventoryItem(item: InventoryItem) {
    const items = await this.getInventory();
    const idx = items.findIndex((i: any) => i.id === item.id);
    if (idx > -1) items[idx] = item;
    else items.push(item);
    localStore.set('haccp_inventory', items);

    if (!supabase) return;
    await supabase.from('haccp_inventory').upsert(item);
  },

  async getMovements(): Promise<StockMovement[]> {
    if (!supabase) return localStore.get('haccp_movements');
    try {
      const { data, error } = await supabase.from('haccp_movements').select('*').order('date', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    } catch (e: any) {
      return localStore.get('haccp_movements');
    }
  },

  async addMovement(mov: StockMovement) {
    const movs = await this.getMovements();
    localStore.set('haccp_movements', [mov, ...movs].slice(0, 50));

    if (!supabase) return;
    await supabase.from('haccp_movements').insert(mov);
  }
};
