
import React, { useState, useEffect, useRef } from 'react';
import { TraceabilityRecord } from '../types';
import { db } from '../services/databaseService';
import { Plus, Camera, Trash2, Calendar, Package, ImageIcon, Loader2, X, ChevronDown, ChevronRight, FileDown, Filter } from 'lucide-react';
import { exportTraceabilityToPDF } from '../services/exportService';

const Traceability: React.FC = () => {
  const [records, setRecords] = useState<TraceabilityRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newRecord, setNewRecord] = useState<Partial<TraceabilityRecord>>({
    itemName: '',
    lotNumber: '',
    expiryDate: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await db.getTraceability();
    setRecords(data);
    if (data.length > 0) {
      const recentDate = data[0].date.split('T')[0];
      setExpandedDates(new Set([recentDate]));
    }
  };

  const handleExportMonthly = async () => {
    setIsExporting(true);
    try {
      const monthlyRecords = records.filter(r => r.date.startsWith(selectedMonth));
      if (monthlyRecords.length === 0) {
        alert("Aucun enregistrement pour ce mois.");
        return;
      }
      const [year, month] = selectedMonth.split('-');
      const monthLabel = new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      await exportTraceabilityToPDF(monthlyRecords, `Registre ${monthLabel}`);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleDate = (date: string) => {
    const next = new Set(expandedDates);
    if (next.has(date)) next.delete(date);
    else next.add(date);
    setExpandedDates(next);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const publicUrl = await db.uploadPhoto(file);
    if (publicUrl) setPreviewUrl(publicUrl);
    setIsUploading(false);
  };

  const saveRecord = async () => {
    if (!newRecord.itemName || !newRecord.expiryDate) return;
    const record: TraceabilityRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      itemName: newRecord.itemName || '',
      lotNumber: newRecord.lotNumber || 'Non spécifié',
      expiryDate: newRecord.expiryDate || '',
      photoUrl: previewUrl || undefined
    };
    await db.addTraceabilityRecord(record);
    await loadRecords();
    setIsAdding(false);
    setPreviewUrl(null);
    setNewRecord({ itemName: '', lotNumber: '', expiryDate: '' });
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Supprimer cet enregistrement ?")) return;
    await db.deleteTraceabilityRecord(id);
    await loadRecords();
  };

  const groupedRecords = records.reduce((groups, record) => {
    const date = record.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {} as Record<string, TraceabilityRecord[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a,b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Traçabilité Photos</h2>
            <p className="text-gray-500">Archives des étiquettes reçues</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            Arrivage du jour
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Exporter par mois :</span>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleExportMonthly}
            disabled={isExporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            <span>Générer Registre Mensuel (PDF)</span>
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-slideUp">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Nouvel arrivage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Produit</label>
              <input 
                type="text" 
                placeholder="Ex: Saumon, Farine, Beurre..."
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newRecord.itemName}
                onChange={e => setNewRecord({...newRecord, itemName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">DLC / DDM</label>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={newRecord.expiryDate}
                onChange={e => setNewRecord({...newRecord, expiryDate: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Photo de l'étiquette</label>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoCapture} />
              {!previewUrl ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-8 bg-indigo-50 text-indigo-600 border-2 border-dashed border-indigo-200 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-indigo-100 transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Camera size={32} />}
                  </div>
                  <span>{isUploading ? 'Chargement...' : 'Prendre l\'étiquette en photo'}</span>
                </button>
              ) : (
                <div className="relative h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                  <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                  <button onClick={() => setPreviewUrl(null)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"><X size={20} /></button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
            <button onClick={saveRecord} disabled={isUploading || !newRecord.itemName} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50">Enregistrer l'étiquette</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleDate(date)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-indigo-500" />
                <h3 className="font-bold text-gray-800">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {groupedRecords[date].length} étiquettes
                </span>
              </div>
              {expandedDates.has(date) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            {expandedDates.has(date) && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                {groupedRecords[date].map(record => (
                  <div key={record.id} className="border border-gray-100 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    {record.photoUrl ? (
                       <div className="h-48 overflow-hidden relative cursor-pointer group" onClick={() => window.open(record.photoUrl, '_blank')}>
                          <img src={record.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={record.itemName} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <ImageIcon className="text-white" size={24} />
                          </div>
                       </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 truncate max-w-[150px]">{record.itemName}</h4>
                          <p className="text-[10px] text-gray-400">Lot: {record.lotNumber}</p>
                        </div>
                        <button onClick={() => deleteRecord(record.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                      <div className="mt-3">
                         <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center gap-1.5 ${new Date(record.expiryDate) < new Date() ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                           DLC: {new Date(record.expiryDate).toLocaleDateString('fr-FR')}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {records.length === 0 && !isAdding && (
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
          <Package size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Aucune étiquette archivée.</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Commencer la traçabilité</button>
        </div>
      )}
    </div>
  );
};

export default Traceability;
