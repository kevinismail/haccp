
import React, { useState, useEffect } from 'react';
import { Recipe, InventoryItem, StockMovement } from '../types';
import { db } from '../services/databaseService';
import { Clock, Search, BookOpen, ShieldAlert, Sparkles, Check, Printer, Loader2 } from 'lucide-react';
import { exportProductionLabel } from '../services/exportService';

const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Fond de veau maison',
    prepTime: '6h',
    category: 'entree',
    shelfLifeDays: 3,
    ingredients: [
      { name: 'Os de veau', amount: 5, unit: 'kg' },
      { name: 'Vin rouge', amount: 1, unit: 'l' }
    ],
    steps: [
      'Blanchir les os de veau à l\'eau bouillante.',
      'Rôtir les os au four à 200°C jusqu\'à coloration.',
      'Ajouter la garniture aromatique et pincer le concentré.',
      'Déglacer au vin rouge et mouiller à hauteur.',
      'Cuire à frémissement pendant 5 heures en écumant régulièrement.'
    ],
    allergens: ['Céleri', 'Sulfite']
  },
  {
    id: '2',
    name: 'Burger Signature',
    prepTime: '15min',
    category: 'plat',
    shelfLifeDays: 1,
    ingredients: [
      { name: 'Pain Brioché', amount: 1, unit: 'pcs' },
      { name: 'Steak 150g', amount: 1, unit: 'pcs' }
    ],
    steps: [
      'Toaster les pains au beurre.',
      'Saisir le steak à la plancha selon la cuisson demandée.',
      'Déposer le cheddar sur le steak en fin de cuisson pour fondre.',
      'Monter le burger : base sauce, steak fromage, oignons, chapeau.'
    ],
    allergens: ['Gluten', 'Lait', 'Œufs', 'Moutarde', 'Sésame']
  }
];

const Recipes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [justProduced, setJustProduced] = useState(false);

  const filteredRecipes = MOCK_RECIPES.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produceRecipe = async () => {
    if (!selectedRecipe) return;
    setIsProcessing(true);

    try {
      const items = await db.getInventory();
      
      for (const ingredient of selectedRecipe.ingredients) {
        const item = items.find(i => i.name.toLowerCase() === ingredient.name.toLowerCase());
        if (item) {
          const updatedItem = {
            ...item,
            currentQuantity: item.currentQuantity - ingredient.amount
          };
          const movement: StockMovement = {
            id: crypto.randomUUID(),
            itemId: item.id,
            itemName: item.name,
            type: 'OUT',
            quantity: ingredient.amount,
            date: new Date().toISOString(),
            reason: `Production: ${selectedRecipe.name}`
          };
          await db.updateInventoryItem(updatedItem);
          await db.addMovement(movement);
        }
      }
      
      setJustProduced(true);
      setTimeout(() => setJustProduced(false), 3000);
    } catch (e) {
      alert("Erreur lors de la mise à jour des stocks.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fiches Techniques</h2>
          <p className="text-gray-500">Recettes & Étiquetage Cloud</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Chercher une recette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none shadow-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          {filteredRecipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => { setSelectedRecipe(recipe); setJustProduced(false); }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedRecipe?.id === recipe.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-300'
              }`}
            >
              <p className="font-bold">{recipe.name}</p>
              <p className="text-xs opacity-80 mt-1">Conservation: {recipe.shelfLifeDays} jours</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedRecipe ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6 animate-slideUp">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => exportProductionLabel(selectedRecipe)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Printer size={20}/></button>
                  <button 
                    onClick={produceRecipe} 
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                      justProduced ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : (justProduced ? <Check size={18}/> : <Sparkles size={18}/>)}
                    {justProduced ? 'Stock déduit' : 'Valider Production'}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
                <ShieldAlert size={18}/> <b>Allergènes:</b> {selectedRecipe.allergens.join(', ')}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Ingrédients</p>
                  <ul className="text-sm space-y-1">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex justify-between"><span>{ing.name}</span> <span className="font-bold">{ing.amount}{ing.unit}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Méthode</p>
                  <p className="text-sm">Temps: {selectedRecipe.prepTime}</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedRecipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="font-bold text-indigo-400">{i+1}.</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p>Sélectionnez une fiche technique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
