
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
  LogOut, CloudCheck, RefreshCw, AlertTriangle, Key
} from 'lucide-react';
import { exportHistoryToPDF } from './services/exportService';

const AUTH_KEY = 'haccp_auth';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);

  useEffect(() => {
    // Vérification de la configuration Supabase
    if (!db.isReady()) {
      setHasConfigError(true);
      setIsLoading(false);
      return;
    }

    const authStatus = localStorage.getItem(AUTH_KEY);
    if (authStatus === 'true') {
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
      const today = new Date().toISOString().split('T')[0];
      
      let currentLogs = fetchedLogs;
      let todayLog = currentLogs.find(l => l.date === today);

      if (!todayLog) {
        todayLog = {
          id: crypto.randomUUID(),
          date: today,
          isLocked: false,
          items: DEFAULT_CHECKLIST.map(item => ({
            ...item,
            completed: false
          }))
        };
        await db.upsertDailyLog(todayLog);
        currentLogs = [todayLog, ...currentLogs];
      }
      setLogs(currentLogs);
    } catch (e) {
      console.error("Failed to load cloud data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const updateTodayLog = async (id: string, updates: Partial<CheckItem>) => {
    setIsSyncing(true);
    const today = new Date().toISOString().split('T')[0];
    const targetLog = logs.find(l => l.date === today);
    if (!targetLog) return;

    const updatedLog = {
      ...targetLog,
      items: targetLog.items.map(item => item.id === id ? { ...item, ...updates } : item)
    };

    const newLogs = logs.map(log => log.date === today ? updatedLog : log);
    setLogs(newLogs);
    
    await db.upsertDailyLog(updatedLog);
    setIsSyncing(false);
  };

  const getTodayLog = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(l => l.date === today) || {
      id: '',
      date: today,
      isLocked: false,
      items: []
    };
  };

  // Écran d'erreur de configuration
  if (hasConfigError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6 border border-amber-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Configuration Requise</h2>
            <p className="text-gray-500 text-sm">
              L'application ne peut pas se connecter à votre base de données Supabase. 
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-left space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase">Action requise :</p>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">1</div>
              <p>Allez dans les <b>Paramètres (Secrets)</b> de votre éditeur ou de Vercel.</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">2</div>
              <p>Ajoutez <b>SUPABASE_URL</b> et <b>SUPABASE_ANON_KEY</b>.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Actualiser l'application
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold text-gray-900">Synchronisation HACCP...</h2>
        <p className="text-gray-500">Récupération sécurisée de vos données.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={(success) => { setIsAuthenticated(success); if(success) loadInitialData(); }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard todayLog={getTodayLog()} onNavigate={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />;
      case 'checklist':
        return <Checklist log={getTodayLog()} onUpdateItem={updateTodayLog} onSave={() => setActiveTab('dashboard')} />;
      case 'traceability':
        return <Traceability />;
      case 'inventory':
        return <Inventory />;
      case 'recipes':
        return <Recipes />;
      case 'assistant':
        return <Assistant currentLog={getTodayLog()} />;
      case 'standards':
        return <Standards />;
      case 'history':
        return (
          <div className="space-y-6 animate-fadeIn">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Historique</h2>
                <p className="text-gray-500">Archives des contrôles sanitaires</p>
              </div>
              <button 
                onClick={() => exportHistoryToPDF(logs)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
              >
                <FileDown size={18} />
                <span className="hidden sm:inline">Exporter Historique</span>
              </button>
            </header>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {logs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-800">{new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm text-gray-500">{log.items.filter(i => i.completed).length}/{log.items.length} contrôles effectués</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${log.items.every(i => i.completed) ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    {log.items.every(i => i.completed) ? 'COMPLET' : 'INCOMPLET'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <Dashboard todayLog={getTodayLog()} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row">
      {/* Header Mobile */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheckIcon size={20} />
          </div>
          <h1 className="font-bold text-gray-900">Hygiène La Oncé</h1>
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
            <ShieldCheckIcon size={24} />
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
          <div className="bg-indigo-50 rounded-xl p-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-900 truncate">{RESTAURANT_NAME}</p>
            {isSyncing ? <RefreshCw size={14} className="text-indigo-400 animate-spin" /> : <CloudCheck size={14} className="text-emerald-500" />}
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
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

const ShieldCheckIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default App;
