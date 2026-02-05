
import React, { useState, useEffect } from 'react';
import { DailyLog, CheckItem } from './types';
import { DEFAULT_CHECKLIST, RESTAURANT_NAME } from './constants';
import Dashboard from './components/Dashboard';
import Checklist from './components/Checklist';
import Assistant from './components/Assistant';
import Recipes from './components/Recipes';
import Traceability from './components/Traceability';
import Standards from './components/Standards';
import Inventory from './components/Inventory';
import Login from './components/Login';
import { db } from './services/databaseService';
import { 
  LayoutDashboard, ClipboardList, Sparkles, History, Menu, X, 
  FileDown, BookOpen, PackageSearch, ShieldCheck, Boxes, 
  CloudCheck, RefreshCw, CloudOff, Calendar, LogOut, AlertTriangle
} from 'lucide-react';
import { exportHistoryToPDF } from './services/exportService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('haccp_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const fetchedLogs = await db.getDailyLogs();
      setLogs(fetchedLogs);
      ensureLogExists(activeDate, fetchedLogs);
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('haccp_auth');
    setIsAuthenticated(false);
  };

  const ensureLogExists = async (date: string, currentLogs: DailyLog[]) => {
    let log = currentLogs.find(l => l.date === date);
    if (!log) {
      log = {
        id: crypto.randomUUID(),
        date: date,
        isLocked: false,
        items: DEFAULT_CHECKLIST.map(item => ({
          ...item,
          completed: false
        }))
      };
      await db.upsertDailyLog(log);
      setLogs(prev => [log!, ...prev]);
    }
    return log;
  };

  const updateLog = async (date: string, id: string, updates: Partial<CheckItem>) => {
    setIsSyncing(true);
    const targetLog = logs.find(l => l.date === date);
    if (!targetLog) return;

    const updatedLog = {
      ...targetLog,
      items: targetLog.items.map(item => item.id === id ? { ...item, ...updates } : item)
    };

    setLogs(prev => prev.map(log => log.date === date ? updatedLog : log));
    await db.upsertDailyLog(updatedLog);
    setIsSyncing(false);
  };

  const getActiveLog = () => {
    return logs.find(l => l.date === activeDate) || {
      id: '',
      date: activeDate,
      isLocked: false,
      items: []
    };
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      ensureLogExists(activeDate, logs);
    }
  }, [activeDate, isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={(success) => {
      if (success) {
        setIsAuthenticated(true);
        loadInitialData();
      }
    }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold text-gray-900">Synchronisation HACCP...</h2>
        <p className="text-gray-500">Accès sécurisé à vos registres Cloud.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard todayLog={getActiveLog()} onNavigate={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />;
      case 'checklist':
        return (
          <Checklist 
            log={getActiveLog()} 
            onUpdateItem={(id, updates) => updateLog(activeDate, id, updates)} 
            onDateChange={setActiveDate}
            onSave={() => setActiveTab('dashboard')} 
          />
        );
      case 'traceability':
        return <Traceability />;
      case 'inventory':
        return <Inventory />;
      case 'recipes':
        return <Recipes />;
      case 'assistant':
        return <Assistant currentLog={getActiveLog()} />;
      case 'standards':
        return <Standards />;
      case 'history':
        return (
          <div className="space-y-6 animate-fadeIn">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Historique complet</h2>
                <p className="text-gray-500">Consultez et modifiez vos archives</p>
              </div>
              <button 
                onClick={() => exportHistoryToPDF(logs)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
              >
                <FileDown size={18} />
                <span className="hidden sm:inline">Exporter Rapport Global</span>
              </button>
            </header>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {logs.sort((a,b) => b.date.localeCompare(a.date)).map(log => (
                <button 
                  key={log.id} 
                  onClick={() => { setActiveDate(log.date); setActiveTab('checklist'); }}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${log.items.every(i => i.completed) ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-sm text-gray-500">{log.items.filter(i => i.completed).length}/{log.items.length} points contrôlés</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${log.items.every(i => i.completed) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                      {log.items.every(i => i.completed) ? 'COMPLET' : 'À COMPLÉTER'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return <Dashboard todayLog={getActiveLog()} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row">
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={20} />
          </div>
          <h1 className="font-bold text-gray-900">La Oncé HACCP</h1>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`
        fixed inset-0 z-40 md:relative md:flex md:w-64 md:flex-col bg-white border-r border-gray-200 transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">La Oncé</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 pt-16 md:pt-0 overflow-y-auto pb-8">
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} icon={<LayoutDashboard size={20} />} label="Tableau de bord" />
          <NavItem active={activeTab === 'checklist'} onClick={() => { setActiveTab('checklist'); setSidebarOpen(false); }} icon={<ClipboardList size={20} />} label="Journal du Jour" />
          <NavItem active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }} icon={<Boxes size={20} />} label="Inventaire" />
          <NavItem active={activeTab === 'traceability'} onClick={() => { setActiveTab('traceability'); setSidebarOpen(false); }} icon={<PackageSearch size={20} />} label="Traçabilité" />
          <NavItem active={activeTab === 'recipes'} onClick={() => { setActiveTab('recipes'); setSidebarOpen(false); }} icon={<BookOpen size={20} />} label="Recettes" />
          <NavItem active={activeTab === 'standards'} onClick={() => { setActiveTab('standards'); setSidebarOpen(false); }} icon={<ShieldCheck size={20} />} label="Normes & Mémos" />
          <NavItem active={activeTab === 'assistant'} onClick={() => { setActiveTab('assistant'); setSidebarOpen(false); }} icon={<Sparkles size={20} />} label="Assistant IA" />
          <NavItem active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setSidebarOpen(false); }} icon={<History size={20} />} label="Historique" />
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Déconnexion</span>
            <LogOut size={16} />
          </button>
          <div className={`rounded-xl p-3 flex items-center justify-between ${db.isCloudEnabled() ? 'bg-indigo-50 text-indigo-900' : 'bg-red-50 text-red-900'}`}>
            <p className="text-xs font-semibold truncate">{RESTAURANT_NAME}</p>
            {isSyncing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : db.isCloudEnabled() ? (
              <CloudCheck size={14} className="text-emerald-500" />
            ) : (
              <div className="flex items-center gap-1 text-red-500" title="Mode Local uniquement">
                <CloudOff size={14} />
                <AlertTriangle size={10} />
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
      ${active 
        ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
