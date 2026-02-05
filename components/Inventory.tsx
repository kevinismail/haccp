
import React, { useState, useEffect } from 'react';
import { InventoryItem, StockMovement } from '../types';
import { db } from '../services/databaseService';
import { Package, Plus, Thermometer, History, ArrowUpRight, ArrowDownRight, Search, Loader2 } from 'lucide-react';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMovement, setNewMovement] = useState<Partial<StockMovement>>({
    itemName: '',
    quantity: 0,
    temperature: undefined,
    reason: 'Livraison'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cloudItems = await db.getInventory();
      const cloudMovs = await db.getMovements();
      setItems(cloudItems);
      setMovements(cloudMovs);
    } catch (e) {
      console.error("Cloud loading failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAction = async (type: 'IN' | 'OUT') => {
    if (!newMovement.itemName || (newMovement.quantity || 0) <= 0) return;

    let targetItem = items.find(i => i.name.toLowerCase() === newMovement.itemName?.toLowerCase());
    
    const qty = Number(newMovement.quantity);
    
    if (!targetItem && type === 'IN') {
      targetItem = {
        id: crypto.randomUUID(),
        name: newMovement.itemName,
        currentQuantity: qty,
        unit: 'u',
        minThreshold: 1,
        category: 'Epicerie',
        lastDeliveryTemp: newMovement.temperature
      };
    } else if (targetItem) {
      targetItem = {
        ...targetItem,
        currentQuantity: type === 'IN' ? targetItem.currentQuantity + qty : targetItem.currentQuantity - qty,
        lastDeliveryTemp: type === 'IN' ? newMovement.temperature : targetItem.lastDeliveryTemp
      };
    } else {
      alert("Produit inconnu pour une sortie.");
      return;
    }

    const mov: StockMovement = {
      id: crypto.randomUUID(),
      itemId: targetItem.id,
      itemName: targetItem.name,
      type,
      quantity: qty,
      date: new Date().toISOString(),
      reason: newMovement.reason || (type === 'IN' ? 'Livraison' : 'Sortie manuelle'),
      temperature: newMovement.temperature
    };

    // Sync to Supabase
    await db.updateInventoryItem(targetItem);
    await db.addMovement(mov);
    
    await loadData(); // Refresh list
    setIsAdding(false);
    setNewMovement({ itemName: '', quantity: 0, temperature: undefined, reason: 'Livraison' });
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <Loader2 size={32} className="animate-spin mb-2" />
        <p>Chargement des stocks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventaire Cloud</h2>
          <p className="text-gray-500">Stock synchronisé en temps réel</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Mouvement
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-slideUp">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Nouveau mouvement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              list="inventory-list"
              placeholder="Produit (ex: Steak, Pain...)"
              className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={newMovement.itemName}
              onChange={e => setNewMovement({...newMovement, itemName: e.target.value})}
            />
            <datalist id="inventory-list">
              {items.map(i => <option key={i.id} value={i.name} />)}
            </datalist>
            <input 
              type="number"
              placeholder="Quantité"
              className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={newMovement.quantity || ''}
              onChange={e => setNewMovement({...newMovement, quantity: Number(e.target.value)})}
            />
            <input 
              type="number"
              step="0.1"
              placeholder="Température Livraison (°C)"
              className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={newMovement.temperature || ''}
              onChange={e => setNewMovement({...newMovement, temperature: Number(e.target.value)})}
            />
            <input 
              type="text"
              placeholder="Motif (ex: Commande Metro)"
              className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={newMovement.reason}
              onChange={e => setNewMovement({...newMovement, reason: e.target.value})}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
            <button onClick={() => handleStockAction('OUT')} className="flex-1 py-3 bg-amber-100 text-amber-700 rounded-xl font-bold">Sortie</button>
            <button onClick={() => handleStockAction('IN')} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Entrée</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Chercher dans les stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Dernière Temp.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.currentQuantity <= item.minThreshold ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <p className="font-bold text-gray-800">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold">{item.currentQuantity} <span className="text-[10px] text-gray-400 font-normal">{item.unit}</span></p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-blue-600">
                      {item.lastDeliveryTemp ? `${item.lastDeliveryTemp}°C` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 flex items-center gap-2"><History size={18}/> Mouvements</h3>
          {movements.map(m => (
            <div key={m.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                {m.type === 'IN' ? <ArrowUpRight className="text-green-500" size={16}/> : <ArrowDownRight className="text-amber-500" size={16}/>}
                <div>
                  <p className="font-bold">{m.itemName}</p>
                  <p className="text-[10px] text-gray-400">{m.reason}</p>
                </div>
              </div>
              <p className={`font-bold ${m.type === 'IN' ? 'text-green-600' : 'text-amber-600'}`}>{m.type === 'IN' ? '+' : '-'}{m.quantity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
