
import React from 'react';
import { DailyLog, CheckItem, HaccpCategory } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { Check, Thermometer, ShieldCheck, Truck, Droplets, Sun, Moon, Coffee, Banknote, Calendar, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { exportDailyLogToPDF } from '../services/exportService';

interface ChecklistProps {
  log: DailyLog;
  onUpdateItem: (id: string, updates: Partial<CheckItem>) => void;
  onDateChange: (date: string) => void;
  onSave: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ log, onUpdateItem, onDateChange, onSave }) => {
  const categories = Object.keys(CATEGORY_LABELS) as HaccpCategory[];

  const changeDay = (offset: number) => {
    const d = new Date(log.date);
    d.setDate(d.getDate() + offset);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const getIcon = (category: string, label: string) => {
    const l = label.toLowerCase();
    if (l.includes('café')) return <Coffee size={18} />;
    if (l.includes('caisse')) return <Banknote size={18} />;
    
    switch(category) {
      case 'ops_opening': return <Sun size={18} />;
      case 'ops_closing': return <Moon size={18} />;
      case 'temperature': return <Thermometer size={18} />;
      case 'cleaning': return <ShieldCheck size={18} />;
      case 'delivery': return <Truck size={18} />;
      case 'oil': return <Droplets size={18} />;
      default: return <Check size={18} />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'ops_opening': return 'bg-orange-100 text-orange-600';
      case 'ops_closing': return 'bg-indigo-100 text-indigo-600';
      case 'temperature': return 'bg-blue-100 text-blue-600';
      case 'cleaning': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <header className="flex flex-col gap-4 sticky top-0 bg-[#f9fafb]/95 backdrop-blur-md py-4 z-20 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registre Opérationnel</h2>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => changeDay(-1)} className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"><ChevronLeft size={20}/></button>
              <div className="relative">
                <input 
                  type="date" 
                  value={log.date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer hover:bg-indigo-50 px-2 py-0.5 rounded transition-all"
                />
              </div>
              <button onClick={() => changeDay(1)} className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
              onClick={() => exportDailyLogToPDF(log)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <FileDown size={18} />
              <span>Export PDF</span>
            </button>
            <button 
              onClick={onSave}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Terminer
            </button>
          </div>
        </div>
      </header>

      {categories.map(cat => {
        const items = log.items.filter(i => i.category === cat);
        if (items.length === 0) return null;
        
        return (
          <section key={cat} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${getCategoryColor(cat)}`}>
                  {getIcon(cat, CATEGORY_LABELS[cat])}
                </span>
                {CATEGORY_LABELS[cat]}
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {items.filter(i => i.completed).length} / {items.length}
              </span>
            </div>
            
            <div className="grid gap-3">
              {items.map(item => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                    item.completed 
                      ? 'bg-green-50/50 border-green-200 shadow-sm' 
                      : 'bg-white border-gray-100 shadow-sm hover:border-gray-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400">{getIcon(item.category, item.label)}</span>
                       <p className={`font-semibold ${item.completed ? 'text-green-800' : 'text-gray-700'}`}>
                        {item.label}
                      </p>
                    </div>
                    
                    {item.category === 'temperature' && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="relative">
                          <input 
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={item.value || ''}
                            onChange={(e) => onUpdateItem(item.id, { value: e.target.value, completed: !!e.target.value })}
                            className={`w-24 pl-3 pr-8 py-2 border rounded-lg font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                              item.completed ? 'bg-white border-green-300 text-green-700' : 'bg-gray-50 border-gray-200'
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">°C</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => onUpdateItem(item.id, { completed: !item.completed, timestamp: !item.completed ? new Date().toISOString() : undefined })}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      item.completed 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-100 scale-105' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                  >
                    <Check size={24} className={item.completed ? 'stroke-[3px]' : ''} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Checklist;