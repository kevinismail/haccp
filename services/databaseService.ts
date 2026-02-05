
import { supabase } from './supabaseClient';
import { DailyLog, TraceabilityRecord, InventoryItem, StockMovement } from '../types';

export const db = {
  // --- JOURNAL QUOTIDIEN ---
  async getDailyLogs(): Promise<DailyLog[]> {
    const { data, error } = await supabase
      .from('haccp_logs')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) return [];
    return data.map(row => ({
      ...row.data,
      id: row.id,
      date: row.date
    }));
  },

  async upsertDailyLog(log: DailyLog) {
    const { error } = await supabase
      .from('haccp_logs')
      .upsert({ 
        id: log.id, 
        date: log.date, 
        data: log 
      });
    if (error) console.error('Supabase Log Error:', error);
  },

  // --- TRAÇABILITÉ & PHOTOS ---
  async getTraceability(): Promise<TraceabilityRecord[]> {
    const { data, error } = await supabase
      .from('haccp_traceability')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) return [];
    return data;
  },

  async addTraceabilityRecord(record: TraceabilityRecord) {
    const { error } = await supabase
      .from('haccp_traceability')
      .insert(record);
    if (error) console.error('Supabase Trace Error:', error);
  },

  async deleteTraceabilityRecord(id: string) {
    const { error } = await supabase
      .from('haccp_traceability')
      .delete()
      .match({ id });
    if (error) console.error('Supabase Delete Trace Error:', error);
  },

  async uploadPhoto(file: File): Promise<string | null> {
    const fileName = `trace-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('traceability-photos')
      .upload(fileName, file);

    if (error) {
      console.error('Upload Error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('traceability-photos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  // --- INVENTAIRE ---
  async getInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('haccp_inventory')
      .select('*');
    if (error) return [];
    return data;
  },

  async updateInventoryItem(item: InventoryItem) {
    const { error } = await supabase
      .from('haccp_inventory')
      .upsert(item);
    if (error) console.error('Supabase Inventory Error:', error);
  },

  async getMovements(): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from('haccp_movements')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);
    if (error) return [];
    return data;
  },

  async addMovement(mov: StockMovement) {
    const { error } = await supabase
      .from('haccp_movements')
      .insert(mov);
    if (error) console.error('Supabase Movement Error:', error);
  }
};
