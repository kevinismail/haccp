
export type HaccpCategory = 'temperature' | 'cleaning' | 'delivery' | 'oil' | 'general' | 'ops_opening' | 'ops_closing' | 'ops_service' | 'traceability';

export interface CheckItem {
  id: string;
  label: string;
  category: HaccpCategory;
  completed: boolean;
  value?: string | number;
  timestamp?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  items: CheckItem[];
  signature?: string;
  isLocked: boolean;
}

export interface TraceabilityRecord {
  id: string;
  date: string;
  itemName: string;
  lotNumber: string;
  expiryDate: string;
  photoUrl?: string;
}

export interface Recipe {
  id: string;
  name: string;
  prepTime: string;
  ingredients: { name: string; amount: number; unit: string }[];
  steps: string[];
  category: 'plat' | 'entree' | 'dessert' | 'cocktail';
  allergens: string[];
  shelfLifeDays: number; // Durée de conservation en jours
}

export interface InventoryItem {
  id: string;
  name: string;
  currentQuantity: number;
  unit: string;
  minThreshold: number;
  category: string;
  lastDeliveryTemp?: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  reason: string; // "Livraison", "Recette: Burger", "Perte", etc.
  temperature?: number;
}

export interface Recommendation {
  severity: 'low' | 'medium' | 'high';
  message: string;
  action: string;
}
