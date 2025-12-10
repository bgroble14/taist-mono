/**
 * Kitchen Appliances - Hardcoded constant
 *
 * These are the appliances customers need to have available
 * for chefs to prepare menu items. IDs must match what's stored
 * in menu item `appliances` field in the database.
 */

export interface IAppliance {
  id: number;
  name: string;
  image: string;
  emoji: string; // Fallback if image fails to load
}

export const APPLIANCES: IAppliance[] = [
  { id: 1, name: 'Sink', image: 'sink.png', emoji: '💧' },
  { id: 2, name: 'Stove', image: 'stove.png', emoji: '🍳' },
  { id: 3, name: 'Oven', image: 'oven.png', emoji: '🔥' },
  { id: 4, name: 'Microwave', image: 'microwave.png', emoji: '📻' },
  { id: 5, name: 'Charcoal Grill', image: 'charcoal_grill.png', emoji: '🍖' },
  { id: 6, name: 'Gas Grill', image: 'gas_grill.png', emoji: '🔥' },
];

/** Get a single appliance by ID */
export const getApplianceById = (id: number): IAppliance | undefined => {
  return APPLIANCES.find(a => a.id === id);
};

/** Get multiple appliances by IDs */
export const getAppliancesByIds = (ids: number[]): IAppliance[] => {
  return APPLIANCES.filter(a => ids.includes(a.id));
};

/** Get appliance names from IDs (for display) */
export const getApplianceNames = (ids: number[]): string[] => {
  return getAppliancesByIds(ids).map(a => a.name);
};
