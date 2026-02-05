
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { RESTAURANT_NAME } from '../constants';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Identifiants demandés : Laonce / kevin
    // On simule un petit délai pour le côté "pro"
    setTimeout(() => {
      if (username.toLowerCase() === 'laonce' && password === 'kevin') {
        localStorage.setItem('haccp_auth', 'true');
        onLogin(true);
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${error ? 'animate-shake' : ''}`}>
        <div className="bg-indigo-600 p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={120} />
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">{RESTAURANT_NAME}</h1>
          <p className="text-indigo-100 text-sm mt-1 uppercase tracking-widest font-medium">Portail HACCP Privé</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
              <AlertCircle size={18} />
              Identifiants incorrects.
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Utilisateur</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Se connecter
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest pt-4">
            Système de traçabilité sécurisé v2.5
          </p>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
