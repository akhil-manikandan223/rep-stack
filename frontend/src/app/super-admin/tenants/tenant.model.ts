import { EntityField, EntityRow } from '../../../shared/entity-page/entity-field.model';

export interface TenantRow extends EntityRow {
  slug: string;
  name: string;
  isActive: boolean;
  createdAt: Date | null;
}

export const TENANT_LIST_FIELDS: EntityField[] = [
  { prop: 'slug', label: 'Slug', type: 'string', width: 160 },
  { prop: 'name', label: 'Name', type: 'string', width: 220 },
  { prop: 'isActive', label: 'Active', type: 'boolean', width: 100 },
  { prop: 'createdAt', label: 'Created', type: 'date', width: 130 },
];

export const TENANT_EDIT_FIELDS: EntityField[] = [
  { prop: 'name', label: 'Name', type: 'string', required: true, width: 220 },
  { prop: 'isActive', label: 'Active', type: 'boolean', width: 100 },
];

export const TENANT_CREATE_FIELDS: EntityField[] = [
  { prop: 'slug', label: 'Slug', type: 'string', required: true, width: 160 },
  { prop: 'name', label: 'Name', type: 'string', required: true, width: 220 },
  { prop: 'adminEmail', label: 'Admin email', type: 'string', required: true, width: 220 },
  { prop: 'adminPassword', label: 'Admin password', type: 'string', required: true, width: 220 },
];

export function createEmptyTenantDraft(): EntityRow {
  return { id: '', slug: '', name: '', adminEmail: '', adminPassword: '' };
}
