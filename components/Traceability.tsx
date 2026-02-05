
import React, { useState, useEffect, useRef } from 'react';
import { TraceabilityRecord } from '../types';
import { db } from '../services/databaseService';
import { Plus, Camera, Trash2, Calendar, Tag, Package, ImageIcon, Loader2, X } from 'lucide-react';

const Traceability: React.FC = () => {
  const [records, setRecords] = useState<TraceabilityRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // 1. Upload to Supabase Storage
    const publicUrl = await db.uploadPhoto(file);
    if (publicUrl) {
      setPreviewUrl(publicUrl);
    }
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traçabilité Cloud</h2>
          <p className="text-gray-500">Registre synchronisé avec photos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Nouveau Produit
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-slideUp">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Enregistrer une étiquette</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Désignation du produit</label>
              <input 
                type="text" 
                placeholder="Ex: Fond de Veau, Saumon..."
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newRecord.itemName}
                onChange={e => setNewRecord({...newRecord, itemName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">N° de Lot</label>
              <input 
                type="text" 
                placeholder="Ex: L12345"
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newRecord.lotNumber}
                onChange={e => setNewRecord({...newRecord, lotNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Date Limite (DLC)</label>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newRecord.expiryDate}
                onChange={e => setNewRecord({...newRecord, expiryDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Preuve Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handlePhotoCapture}
              />
              {!previewUrl ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                  {isUploading ? 'Téléchargement...' : 'Prendre l\'étiquette'}
                </button>
              ) : (
                <div className="relative group">
                  <img src={previewUrl} className="w-full h-32 object-cover rounded-xl border border-gray-200" alt="Preview" />
                  <button 
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
            <button 
              onClick={saveRecord} 
              disabled={isUploading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map(record => (
          <div key={record.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-indigo-200 transition-all overflow-hidden">
            {record.photoUrl ? (
               <div className="h-40 overflow-hidden relative">
                  <img src={record.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={record.itemName} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
               </div>
            ) : (
              <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-300">
                <ImageIcon size={48} />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 text-lg leading-tight">{record.itemName}</h4>
                <button onClick={() => deleteRecord(record.id)} className="text-gray-300 hover:text-red-500 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Tag size={12} /> Lot: <span className="font-semibold text-gray-700">{record.lotNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} /> DLC: <span className={`font-semibold ${new Date(record.expiryDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                    {new Date(record.expiryDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex justify-between items-center">
                <span>Le {new Date(record.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Package size={10} /> Cloud</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {records.length === 0 && !isAdding && (
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
          <Package size={48} className="mb-4 opacity-20" />
          <p>Aucune étiquette enregistrée pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default Traceability;
