
import { supabase } from './supabaseClient';
import { DailyLog, TraceabilityRecord, InventoryItem, StockMovement } from '../types';

// Stockage Local de secours si Supabase est absent
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
    if (!supabase) return localStore.get('haccp_logs');
    
    const { data, error } = await supabase
      .from('haccp_logs')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) return localStore.get('haccp_logs');
    return data.map(row => ({ ...row.data, id: row.id, date: row.date }));
  },

  async upsertDailyLog(log: DailyLog) {
    // Sauvegarde locale systématique (sécurité)
    const logs = await this.getDailyLogs();
    const index = logs.findIndex(l => l.date === log.date);
    if (index > -1) logs[index] = log;
    else logs.unshift(log);
    localStore.set('haccp_logs', logs);

    if (!supabase) return;
    await supabase.from('haccp_logs').upsert({ id: log.id, date: log.date, data: log });
  },

  // --- TRAÇABILITÉ ---
  async getTraceability(): Promise<TraceabilityRecord[]> {
    if (!supabase) return localStore.get('haccp_traceability');
    const { data, error } = await supabase.from('haccp_traceability').select('*').order('date', { ascending: false });
    return error ? localStore.get('haccp_traceability') : data;
  },

  async addTraceabilityRecord(record: TraceabilityRecord) {
    const records = await this.getTraceability();
    localStore.set('haccp_traceability', [record, ...records]);

    if (!supabase) return;
    await supabase.from('haccp_traceability').insert(record);
  },

  async deleteTraceabilityRecord(id: string) {
    const records = await this.getTraceability();
    localStore.set('haccp_traceability', records.filter((r: any) => r.id !== id));

    if (!supabase) return;
    await supabase.from('haccp_traceability').delete().match({ id });
  },

  async uploadPhoto(file: File): Promise<string | null> {
    if (!supabase) {
      // Simulation d'upload en local (Base64 pour l'aperçu si petite image)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    
    const fileName = `trace-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage.from('traceability-photos').upload(fileName, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from('traceability-photos').getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  // --- INVENTAIRE ---
  async getInventory(): Promise<InventoryItem[]> {
    if (!supabase) return localStore.get('haccp_inventory');
    const { data, error } = await supabase.from('haccp_inventory').select('*');
    return error ? localStore.get('haccp_inventory') : data;
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
    const { data, error } = await supabase.from('haccp_movements').select('*').order('date', { ascending: false }).limit(30);
    return error ? localStore.get('haccp_movements') : data;
  },

  async addMovement(mov: StockMovement) {
    const movs = await this.getMovements();
    localStore.set('haccp_movements', [mov, ...movs].slice(0, 50));

    if (!supabase) return;
    await supabase.from('haccp_movements').insert(mov);
  }
};
