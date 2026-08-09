import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';
import { TenantAuthService } from '../../shared/tenant-auth.service';
import { EntityDetailPage } from '../../shared/entity-page/entity-detail-page/entity-detail-page';
import { EntityRow } from '../../shared/entity-page/entity-field.model';
import { EntityListPage } from '../../shared/entity-page/entity-list-page/entity-list-page';
import {
  createEmptyMemberDraft,
  MEMBER_CREATE_FIELDS,
  MEMBER_EDIT_FIELDS,
  MEMBER_LIST_FIELDS,
} from './member.model';
import { MembersService } from './members.service';

type DialogMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-members',
  imports: [EntityListPage, EntityDetailPage],
  host: { class: 'flex h-full min-h-0 flex-col gap-4' },
  providers: [provideIcons({ lucideUsers })],
  templateUrl: './members.html',
  styleUrl: './members.scss',
})
export class Members implements OnInit {
  private readonly membersService = inject(MembersService);
  private readonly authService = inject(TenantAuthService);

  protected readonly rows = this.membersService.rows;

  protected readonly dialogMode = signal<DialogMode>(null);
  protected readonly editingRow = signal<EntityRow | null>(null);
  protected readonly editingMemberId = signal<string | null>(null);

  protected readonly createFields = MEMBER_CREATE_FIELDS;
  protected readonly editFields = MEMBER_EDIT_FIELDS;
  protected readonly listFields = MEMBER_LIST_FIELDS;

  // Coaches/trainers get a read-only roster; admin and front-desk manage it.
  protected readonly canManage = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'tenant_admin' || role === 'front_desk';
  });

  ngOnInit(): void {
    void this.membersService.load();
  }

  protected openCreate(): void {
    this.editingRow.set(createEmptyMemberDraft());
    this.editingMemberId.set(null);
    this.dialogMode.set('create');
  }

  protected openEdit(row: EntityRow): void {
    this.editingRow.set(row);
    this.editingMemberId.set(row.id);
    this.dialogMode.set('edit');
  }

  protected closeDialog(): void {
    this.dialogMode.set(null);
    this.editingRow.set(null);
    this.editingMemberId.set(null);
  }

  protected async save(row: EntityRow): Promise<void> {
    if (this.dialogMode() === 'create') {
      await this.membersService.create(row);
    } else {
      await this.membersService.update(this.editingMemberId()!, row);
    }
    this.closeDialog();
  }
}
