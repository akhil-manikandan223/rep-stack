import { EntityField, EntityRow } from '../../shared/entity-page/entity-field.model';

export interface StaffRow extends EntityRow {
  email: string;
  role: string;
  isActive: boolean;
  availabilityStatus: string | null;
}

const ROLE_OPTIONS = [
  { value: 'tenant_admin', label: 'Tenant Admin' },
  { value: 'general_coach', label: 'General Coach' },
  { value: 'personal_trainer', label: 'Personal Trainer' },
  { value: 'front_desk', label: 'Front Desk Staff' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'off_shift', label: 'Off Shift' },
];

export const STAFF_LIST_FIELDS: EntityField[] = [
  { prop: 'email', label: 'Email', type: 'string', width: 240 },
  { prop: 'role', label: 'Role', type: 'enum', width: 180, enumOptions: ROLE_OPTIONS },
  { prop: 'isActive', label: 'Active', type: 'boolean', width: 90 },
  {
    prop: 'availabilityStatus',
    label: 'Availability',
    type: 'enum',
    width: 130,
    enumOptions: AVAILABILITY_OPTIONS,
  },
];

export const STAFF_CREATE_FIELDS: EntityField[] = [
  { prop: 'email', label: 'Email', type: 'string', required: true, width: 240 },
  { prop: 'password', label: 'Password', type: 'string', required: true, width: 200 },
  { prop: 'role', label: 'Role', type: 'enum', required: true, width: 180, enumOptions: ROLE_OPTIONS },
];

export const STAFF_EDIT_FIELDS: EntityField[] = [
  { prop: 'role', label: 'Role', type: 'enum', required: true, width: 180, enumOptions: ROLE_OPTIONS },
  { prop: 'isActive', label: 'Active', type: 'boolean', width: 90 },
  {
    prop: 'availabilityStatus',
    label: 'Availability',
    type: 'enum',
    width: 130,
    enumOptions: AVAILABILITY_OPTIONS,
  },
];

export function createEmptyStaffDraft(): EntityRow {
  return { id: '', email: '', password: '', role: '' };
}
