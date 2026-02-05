
import React, { useState } from 'react';
import { analyzeHaccpLogs, getSafetyAdvice } from '../services/geminiService';
import { DailyLog } from '../types';
import { Send, Sparkles, ClipboardCheck, MessageSquare } from 'lucide-react';

interface AssistantProps {
  currentLog: DailyLog;
}

const Assistant: React.FC<AssistantProps> = ({ currentLog }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setResponse(null);
    const result = await analyzeHaccpLogs(currentLog);
    setResponse(result);
    setLoading(false);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    const result = await getSafetyAdvice(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-2">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Assistant HACCP IA</h2>
        <p className="text-gray-500">Votre expert digital en sécurité alimentaire</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={handleAnalysis}
          disabled={loading}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all group disabled:opacity-50"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ClipboardCheck size={24} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-800">Analyser les relevés du jour</h4>
              <p className="text-xs text-gray-500">Générer un rapport de conformité automatique</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
            <Send size={16} />
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
           <MessageSquare size={18} className="text-indigo-600" />
           <span className="font-semibold text-gray-800">Poser une question spécifique</span>
        </div>
        <form onSubmit={handleAsk} className="p-4 space-y-4">
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Quelle est la durée de conservation d'un fond de veau maison au frigo ?"
            className="w-full h-24 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 resize-none"
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
               <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Interroger l'IA</span>
                <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {response && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-slideUp">
           <div className="flex items-start space-x-3">
             <div className="mt-1">
               <Sparkles size={20} className="text-indigo-600" />
             </div>
             <div className="prose prose-indigo max-w-none text-gray-800 whitespace-pre-wrap">
               {response}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;
