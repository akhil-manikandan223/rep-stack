import { EntityField, EntityRow } from '../../shared/entity-page/entity-field.model';

export interface MemberRow extends EntityRow {
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  hasPtPlan: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const MEMBER_LIST_FIELDS: EntityField[] = [
  { prop: 'fullName', label: 'Name', type: 'string', width: 220 },
  { prop: 'email', label: 'Email', type: 'string', width: 220 },
  { prop: 'phone', label: 'Phone', type: 'string', width: 150 },
  { prop: 'status', label: 'Status', type: 'enum', width: 120, enumOptions: STATUS_OPTIONS },
  { prop: 'hasPtPlan', label: 'PT Plan', type: 'boolean', width: 90 },
];

export const MEMBER_CREATE_FIELDS: EntityField[] = [
  { prop: 'fullName', label: 'Name', type: 'string', required: true, width: 220 },
  { prop: 'email', label: 'Email', type: 'string', width: 220 },
  { prop: 'phone', label: 'Phone', type: 'string', width: 150 },
  { prop: 'hasPtPlan', label: 'PT Plan', type: 'boolean', width: 90 },
];

export const MEMBER_EDIT_FIELDS: EntityField[] = [
  { prop: 'fullName', label: 'Name', type: 'string', required: true, width: 220 },
  { prop: 'email', label: 'Email', type: 'string', width: 220 },
  { prop: 'phone', label: 'Phone', type: 'string', width: 150 },
  { prop: 'status', label: 'Status', type: 'enum', width: 120, enumOptions: STATUS_OPTIONS },
  { prop: 'hasPtPlan', label: 'PT Plan', type: 'boolean', width: 90 },
];

export function createEmptyMemberDraft(): EntityRow {
  return { id: '', fullName: '', email: '', phone: '', hasPtPlan: false };
}
