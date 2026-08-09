import { EntityField, EntityRow } from '../../../shared/entity-page/entity-field.model';

export interface Equipment extends EntityRow {
  name: string;
  category: string;
  zoneId: string;
  purchaseDate: Date | null;
  status: string;
  quantity: number;
}

interface Zone {
  id: string;
  name: string;
  category: string;
}

const ZONES: Zone[] = [
  { id: 'zone-a', name: 'Zone A - Cardio Deck', category: 'cardio' },
  { id: 'zone-b', name: 'Zone B - Strength Floor', category: 'strength' },
  { id: 'zone-c', name: 'Zone C - Free Weights', category: 'free-weights' },
];

export const EQUIPMENT_FIELDS: EntityField[] = [
  { prop: 'name', label: 'Name', type: 'string', required: true, width: 200 },
  {
    prop: 'category',
    label: 'Category',
    type: 'enum',
    required: true,
    width: 140,
    enumOptions: [
      { value: 'cardio', label: 'Cardio' },
      { value: 'strength', label: 'Strength' },
      { value: 'free-weights', label: 'Free Weights' },
    ],
  },
  {
    prop: 'zoneId',
    label: 'Zone',
    type: 'select',
    width: 200,
    lookup: {
      cascadeFrom: 'category',
      // Called with no argument for list-display lookups (resolve id -> name across all zones)
      // and with the parent field's value for the cascading dropdown in the form.
      options: (cascadeValue) =>
        (cascadeValue == null ? ZONES : ZONES.filter((zone) => zone.category === cascadeValue)).map(
          ({ id, name }) => ({ id, name }),
        ),
    },
  },
  { prop: 'purchaseDate', label: 'Purchase date', type: 'date', width: 130 },
  {
    prop: 'status',
    label: 'Status',
    type: 'enum',
    required: true,
    width: 130,
    enumOptions: [
      { value: 'active', label: 'Active' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'retired', label: 'Retired' },
    ],
  },
  { prop: 'quantity', label: 'Quantity', type: 'number', width: 100 },
];

export function createEmptyEquipment(): Omit<Equipment, 'id'> {
  return {
    name: '',
    category: '',
    zoneId: '',
    purchaseDate: null,
    status: '',
    quantity: 0,
  };
}

export const EQUIPMENT_SEED: Equipment[] = [
  {
    id: '1',
    name: 'Treadmill #1',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2023-01-15'),
    status: 'active',
    quantity: 4,
  },
  {
    id: '2',
    name: 'Rowing Machine #2',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2022-11-02'),
    status: 'maintenance',
    quantity: 2,
  },
  {
    id: '3',
    name: 'Power Rack',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2021-06-20'),
    status: 'active',
    quantity: 3,
  },
  {
    id: '4',
    name: 'Adjustable Dumbbell Set',
    category: 'free-weights',
    zoneId: 'zone-c',
    purchaseDate: new Date('2024-03-10'),
    status: 'active',
    quantity: 6,
  },
  {
    id: '5',
    name: 'Cable Crossover Machine',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2020-09-05'),
    status: 'retired',
    quantity: 1,
  },
  {
    id: '1',
    name: 'Treadmill #1',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2023-01-15'),
    status: 'active',
    quantity: 4,
  },
  {
    id: '2',
    name: 'Rowing Machine #2',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2022-11-02'),
    status: 'maintenance',
    quantity: 2,
  },
  {
    id: '3',
    name: 'Power Rack',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2021-06-20'),
    status: 'active',
    quantity: 3,
  },
  {
    id: '4',
    name: 'Adjustable Dumbbell Set',
    category: 'free-weights',
    zoneId: 'zone-c',
    purchaseDate: new Date('2024-03-10'),
    status: 'active',
    quantity: 6,
  },
  {
    id: '5',
    name: 'Cable Crossover Machine',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2020-09-05'),
    status: 'retired',
    quantity: 1,
  },
  {
    id: '1',
    name: 'Treadmill #1',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2023-01-15'),
    status: 'active',
    quantity: 4,
  },
  {
    id: '2',
    name: 'Rowing Machine #2',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2022-11-02'),
    status: 'maintenance',
    quantity: 2,
  },
  {
    id: '3',
    name: 'Power Rack',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2021-06-20'),
    status: 'active',
    quantity: 3,
  },
  {
    id: '4',
    name: 'Adjustable Dumbbell Set',
    category: 'free-weights',
    zoneId: 'zone-c',
    purchaseDate: new Date('2024-03-10'),
    status: 'active',
    quantity: 6,
  },
  {
    id: '5',
    name: 'Cable Crossover Machine',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2020-09-05'),
    status: 'retired',
    quantity: 1,
  },
  {
    id: '1',
    name: 'Treadmill #1',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2023-01-15'),
    status: 'active',
    quantity: 4,
  },
  {
    id: '2',
    name: 'Rowing Machine #2',
    category: 'cardio',
    zoneId: 'zone-a',
    purchaseDate: new Date('2022-11-02'),
    status: 'maintenance',
    quantity: 2,
  },
  {
    id: '3',
    name: 'Power Rack',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2021-06-20'),
    status: 'active',
    quantity: 3,
  },
  {
    id: '4',
    name: 'Adjustable Dumbbell Set',
    category: 'free-weights',
    zoneId: 'zone-c',
    purchaseDate: new Date('2024-03-10'),
    status: 'active',
    quantity: 6,
  },
  {
    id: '5',
    name: 'Cable Crossover Machine',
    category: 'strength',
    zoneId: 'zone-b',
    purchaseDate: new Date('2020-09-05'),
    status: 'retired',
    quantity: 1,
  },
  
];
