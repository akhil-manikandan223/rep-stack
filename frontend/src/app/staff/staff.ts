import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideUserCog } from '@ng-icons/lucide';
import { TenantAuthService } from '../../shared/tenant-auth.service';
import { EntityDetailPage } from '../../shared/entity-page/entity-detail-page/entity-detail-page';
import { EntityRow } from '../../shared/entity-page/entity-field.model';
import { EntityListPage } from '../../shared/entity-page/entity-list-page/entity-list-page';
import { createEmptyStaffDraft, STAFF_CREATE_FIELDS, STAFF_EDIT_FIELDS, STAFF_LIST_FIELDS } from './staff.model';
import { StaffService } from './staff.service';

type DialogMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-staff',
  imports: [EntityListPage, EntityDetailPage],
  host: { class: 'flex h-full min-h-0 flex-col gap-4' },
  providers: [provideIcons({ lucideUserCog })],
  templateUrl: './staff.html',
  styleUrl: './staff.scss',
})
export class Staff implements OnInit {
  private readonly staffService = inject(StaffService);
  private readonly authService = inject(TenantAuthService);

  protected readonly rows = this.staffService.rows;

  protected readonly dialogMode = signal<DialogMode>(null);
  protected readonly editingRow = signal<EntityRow | null>(null);
  protected readonly editingUserId = signal<string | null>(null);

  protected readonly createFields = STAFF_CREATE_FIELDS;
  protected readonly editFields = STAFF_EDIT_FIELDS;
  protected readonly listFields = STAFF_LIST_FIELDS;

  // Front-desk can read the staff directory (to see coaches' status) but not manage it.
  protected readonly canManage = computed(() => this.authService.currentUser()?.role === 'tenant_admin');

  ngOnInit(): void {
    void this.staffService.load();
  }

  protected openCreate(): void {
    this.editingRow.set(createEmptyStaffDraft());
    this.editingUserId.set(null);
    this.dialogMode.set('create');
  }

  protected openEdit(row: EntityRow): void {
    this.editingRow.set(row);
    this.editingUserId.set(row.id);
    this.dialogMode.set('edit');
  }

  protected closeDialog(): void {
    this.dialogMode.set(null);
    this.editingRow.set(null);
    this.editingUserId.set(null);
  }

  protected async save(row: EntityRow): Promise<void> {
    if (this.dialogMode() === 'create') {
      await this.staffService.create(row);
    } else {
      await this.staffService.update(this.editingUserId()!, row);
    }
    this.closeDialog();
  }
}
