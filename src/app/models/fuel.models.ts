export type ValidationErrorCode =
  | 'kilometersMin'
  | 'consumptionMin'
  | 'priceMin'
  | 'passengersMin';

export interface FuelType {
  id: string;
  name: string;
  icon: string;
}

export const FUEL_TYPES: FuelType[] = [
  { id: 'gasoline', name: 'Gasolina', icon: 'flame' },
  { id: 'diesel', name: 'Diésel', icon: 'water-outline' },
  { id: 'electric', name: 'Eléctrico', icon: 'flash' },
  { id: 'lpg', name: 'GLP', icon: 'cloud' },
];

export const DEFAULT_FUEL_PRICES: Record<string, number> = {
  gasoline: 1.60,
  diesel: 1.50,
  electric: 0.25,
  lpg: 0.80,
};

export interface CalculationResult {
  litersConsumed: number;
  totalCost: number;
  costPerPerson: number;
  savingsPerPerson: number;
}

export interface FuelCalculation {
  kilometers: number;
  averageConsumption: number;
  fuelPrice: number;
  passengers: number;
  fuelType: string;
  tripName?: string;
  result?: CalculationResult;
  timestamp?: number;
}
