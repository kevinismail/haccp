
import React from 'react';
import { DailyLog, HaccpCategory } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { CheckCircle, AlertCircle, Clock, ChevronRight, FileDown } from 'lucide-react';
import { exportDailyLogToPDF } from '../services/exportService';

const StatCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

interface DashboardProps {
  todayLog: DailyLog;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ todayLog, onNavigate }) => {
  const completedCount = todayLog.items.filter(i => i.completed).length;
  const totalCount = todayLog.items.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const getCategoryStatus = (cat: HaccpCategory) => {
    const items = todayLog.items.filter(i => i.category === cat);
    const done = items.filter(i => i.completed).length;
    return `${done}/${items.length}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-500">Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button 
          onClick={() => exportDailyLogToPDF(todayLog)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
        >
          <FileDown size={18} />
          <span>Exporter PDF</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Progression HACCP" 
          value={`${progress}%`} 
          color="bg-blue-50 text-blue-600"
          icon={<Clock size={24} />}
        />
        <StatCard 
          label="Contrôles Validés" 
          value={`${completedCount}/${totalCount}`} 
          color="bg-green-50 text-green-600"
          icon={<CheckCircle size={24} />}
        />
        <StatCard 
          label="Alertes Sanitaires" 
          value="0" 
          color="bg-red-50 text-red-600"
          icon={<AlertCircle size={24} />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">État des sections</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <button 
              key={cat}
              onClick={() => onNavigate('checklist')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${todayLog.items.filter(i => i.category === cat && !i.completed).length === 0 ? 'bg-green-500' : 'bg-amber-400'}`} />
                <span className="font-medium text-gray-700">{CATEGORY_LABELS[cat]}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 font-medium">
                <span>{getCategoryStatus(cat as HaccpCategory)} effectués</span>
                <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">Conseil Hygiène IA</h3>
          <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
            "Pensez à bien étiqueter tous vos bacs gastronormes avec la date de production et d'ouverture. C'est le premier point vérifié en cas d'inspection."
          </p>
          <button 
             onClick={() => onNavigate('assistant')}
             className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Poser une question
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;
