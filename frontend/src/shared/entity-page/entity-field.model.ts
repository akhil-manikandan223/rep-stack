export type EntityValue = string | number | boolean | Date | null;

export type EntityRow = Record<string, EntityValue> & { id: string };

export type EntityFieldType = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'enum';

export interface EntityLookupOption {
  id: string;
  name: string;
}

export interface EntityField {
  prop: string;
  label: string;
  type: EntityFieldType;
  required?: boolean;
  /** Default true. */
  sortable?: boolean;
  /** Default true for string/number/date; false for boolean/enum/select. */
  filterable?: boolean;
  /** Column width in px for the list view. */
  width?: number;
  /** Options for type: 'enum'. */
  enumOptions?: { value: string; label: string }[];
  /** Config for type: 'select'. */
  lookup?: {
    /**
     * Returns the available options. Called with no argument for list-display
     * lookups (resolve an id to a name across ALL options, not a filtered
     * subset) and, when `cascadeFrom` is set, with the current value of that
     * sibling field for the cascading dropdown in the form. Implementations
     * must return the full set when `cascadeValue` is nullish.
     */
    options: (cascadeValue?: EntityValue) => EntityLookupOption[];
    /** prop of a sibling field this lookup's options depend on. */
    cascadeFrom?: string;
  };
}

export function isFilterableField(field: EntityField): boolean {
  if (field.filterable != null) return field.filterable;
  return field.type === 'string' || field.type === 'number' || field.type === 'date';
}

export function isSortableField(field: EntityField): boolean {
  return field.sortable ?? true;
}
