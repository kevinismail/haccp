
import React from 'react';
import { COLOR_BOARDS, ALLERGENS_LIST } from '../constants';
import { Info, Waves, ShieldAlert, Palette, Droplets, Timer } from 'lucide-react';

const Standards: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Mémo Normes HACCP</h2>
        <p className="text-gray-500">Rappels des bonnes pratiques d'hygiène</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lavage des mains */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Waves size={24} />
            <h3 className="font-bold text-lg">Lavage des mains</h3>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3 mb-2">
            <Timer size={20} className="text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800 font-bold leading-tight">
              RECOMMANDATION : Se laver les mains toutes les 15 à 30 minutes en période de service intense.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "En arrivant au poste de travail",
              "Après avoir touché des denrées souillées (cartons, œufs, terre...)",
              "Après chaque passage aux toilettes (lavage + désinfection)",
              "Après s'être mouché, avoir fumé ou touché son visage",
              "Entre deux manipulations de produits différents (ex: poulet cru vers légumes)",
              "Toutes les 15-30 min : lavage réflexe de sécurité pendant le rush"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Code Couleur Planches */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <Palette size={24} />
            <h3 className="font-bold text-lg">Code Couleur Planches</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COLOR_BOARDS.map((board, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-md shadow-sm ${board.class}`} />
                <div className="text-xs">
                  <p className="font-bold text-gray-800">{board.color}</p>
                  <p className="text-gray-500">{board.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Les 14 Allergènes */}
        <div className="md:col-span-2 bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <ShieldAlert size={24} />
            <h3 className="font-bold text-lg">Les 14 Allergènes Majeurs</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS_LIST.map((allergen, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-amber-200 text-amber-800 rounded-full text-xs font-semibold shadow-sm">
                {allergen}
              </span>
            ))}
          </div>
          <p className="text-xs text-amber-600 italic">L'information sur les allergènes est obligatoire pour les denrées non pré-emballées.</p>
        </div>

        {/* Tenue & Torchons */}
        <div className="md:col-span-2 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col md:flex-row gap-6">
           <div className="flex-1 space-y-3">
             <div className="flex items-center gap-3 text-indigo-700">
               <Droplets size={24} />
               <h3 className="font-bold text-lg">Linge & Petit matériel</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                 <p className="font-bold text-indigo-800 text-sm mb-1">Torchons</p>
                 <p className="text-xs text-gray-600 leading-relaxed">À changer au minimum 2 fois par jour (Matin/Soir). Ne jamais utiliser de torchon sale ou humide pour le service.</p>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                 <p className="font-bold text-indigo-800 text-sm mb-1">Plonge</p>
                 <p className="text-xs text-gray-600 leading-relaxed">Les éponges et lavettes doivent être désinfectées quotidiennement et changées dès signe d'usure.</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Standards;
