
import { CheckItem } from './types';

export const RESTAURANT_NAME = "La Oncé";

export const DEFAULT_CHECKLIST: Omit<CheckItem, 'completed' | 'timestamp'>[] = [
  // --- OUVERTURE ---
  { id: 'op-tables', label: 'Mise en place salle & coup d\'éponge tables', category: 'ops_opening' },
  { id: 'op-caisse-in', label: 'Ouverture caisse & comptage fond de caisse', category: 'ops_opening' },
  { id: 'op-coffee-on', label: 'Mise en route machine à café & test débit', category: 'ops_opening' },
  { id: 'op-prep', label: 'Mise en place cuisine & vérification DLC', category: 'ops_opening' },

  // --- HACCP TEMPERATURES ---
  { id: 't-cuisine-am', label: 'Frigo Cuisine - Matin (+2°C/+4°C)', category: 'temperature' },
  { id: 't-bar-am', label: 'Frigo Bar - Matin (+2°C/+4°C)', category: 'temperature' },
  { id: 't-boissons-am', label: 'Frigo Boissons - Matin (+2°C/+4°C)', category: 'temperature' },
  
  { id: 't-cuisine-pm', label: 'Frigo Cuisine - Soir (+2°C/+4°C)', category: 'temperature' },
  { id: 't-bar-pm', label: 'Frigo Bar - Soir (+2°C/+4°C)', category: 'temperature' },
  { id: 't-boissons-pm', label: 'Frigo Boissons - Soir (+2°C/+4°C)', category: 'temperature' },

  // --- HYGIÈNE & TRAÇABILITÉ ---
  { id: 'g-hygiene', label: 'Lavage des mains & tenue propre (Tablier/Coiffe)', category: 'general' },
  { id: 'g-trace', label: 'Enregistrement étiquettes produits du jour', category: 'general' },
  { id: 'g-boards', label: 'Respect code couleur planches (Rouge/Vert/Bleu)', category: 'general' },
  { id: 'g-knives', label: 'Désinfection des couteaux (Armoire UV ou Solution)', category: 'general' },

  // --- ENTRETIEN SPÉCIFIQUE ---
  { id: 'c-linen-am', label: 'Changement des torchons de service (Matin)', category: 'cleaning' },
  { id: 'c-plonge-cl', label: 'Changement lavettes & éponges plonge', category: 'cleaning' },
  { id: 'c-coffee-clean', label: 'Nettoyage complet machine café & filtres', category: 'cleaning' },
  { id: 'c-floor', label: 'Désinfection des sols cuisine & salle', category: 'cleaning' },

  // --- FERMETURE ---
  { id: 'c-linen-pm', label: 'Changement des torchons de service (Soir)', category: 'ops_closing' },
  { id: 'cl-caisse-out', label: 'Fermeture caisse & rapport Z', category: 'ops_closing' },
  { id: 'cl-extinguish', label: 'Vérification extinction feux & lumières', category: 'ops_closing' },
  { id: 'cl-trash', label: 'Sortie des poubelles & nettoyage containers', category: 'ops_closing' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  ops_opening: 'Ouverture Matin',
  temperature: 'Relevés Températures',
  general: 'Hygiène & Normes',
  cleaning: 'Entretien & Linge',
  ops_closing: 'Fermeture Soir',
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
  { color: 'Blanc', usage: 'Produits laitiers & pains', class: 'bg-white border border-gray-200' },
  { color: 'Marron', usage: 'Viandes cuites', class: 'bg-amber-800' },
];
