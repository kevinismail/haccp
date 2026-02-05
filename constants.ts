
import { CheckItem } from './types';

export const RESTAURANT_NAME = "La Oncé";

export const DEFAULT_CHECKLIST: Omit<CheckItem, 'completed' | 'timestamp'>[] = [
  // OUVERTURE
  { id: 'op-tables', label: 'Mise en place salle & tables propres', category: 'ops_opening' },
  { id: 'op-caisse-in', label: 'Ouverture caisse & comptage', category: 'ops_opening' },
  { id: 'op-coffee', label: 'Machine à café & test débit', category: 'ops_opening' },
  { id: 'op-prep', label: 'Mise en place & vérification DLC', category: 'ops_opening' },

  // HACCP TEMPÉRATURES
  { id: 't-cuisine-am', label: 'Frigo Cuisine - Matin (+2°/+4°C)', category: 'temperature' },
  { id: 't-bar-am', label: 'Frigo Bar - Matin (+2°/+4°C)', category: 'temperature' },
  { id: 't-boissons-am', label: 'Frigo Boissons - Matin (+2°/+4°C)', category: 'temperature' },
  { id: 't-cuisine-pm', label: 'Frigo Cuisine - Soir (+2°/+4°C)', category: 'temperature' },
  { id: 't-bar-pm', label: 'Frigo Bar - Soir (+2°/+4°C)', category: 'temperature' },

  // HYGIÈNE
  { id: 'g-hygiene', label: 'Tenue propre & lavage mains', category: 'general' },
  { id: 'g-trace', label: 'Enregistrement étiquettes du jour', category: 'general' },
  { id: 'g-boards', label: 'Respect code couleur planches', category: 'general' },

  // ENTRETIEN
  { id: 'c-linen', label: 'Changement des torchons', category: 'cleaning' },
  { id: 'c-floor', label: 'Désinfection des sols', category: 'cleaning' },

  // FERMETURE
  { id: 'cl-caisse-out', label: 'Fermeture caisse & rapport Z', category: 'ops_closing' },
  { id: 'cl-extinguish', label: 'Extinction feux & lumières', category: 'ops_closing' },
  { id: 'cl-trash', label: 'Sortie des poubelles', category: 'ops_closing' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  ops_opening: 'Ouverture',
  temperature: 'Températures',
  general: 'Normes Hygiène',
  cleaning: 'Entretien',
  ops_closing: 'Fermeture',
};

export const ALLERGENS_LIST = [
  'Gluten', 'Crustacés', 'Œufs', 'Poissons', 'Arachides', 'Soja', 'Lait', 
  'Fruits à coque', 'Céleri', 'Moutarde', 'Sésame', 'Sulfite', 'Lupin', 'Mollusques'
];

export const COLOR_BOARDS = [
  { color: 'Rouge', usage: 'Viandes crues', class: 'bg-red-500' },
  { color: 'Bleu', usage: 'Poissons crus', class: 'bg-blue-500' },
  { color: 'Vert', usage: 'Fruits & Légumes', class: 'bg-green-500' },
  { color: 'Jaune', usage: 'Volailles crues', class: 'bg-yellow-400' },
  { color: 'Blanc', usage: 'Laitages & Pains', class: 'bg-white border' },
  { color: 'Marron', usage: 'Viandes cuites', class: 'bg-amber-800' },
];
