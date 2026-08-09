import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideBuilding2 } from '@ng-icons/lucide';
import { tenantAppUrl } from '../../../shared/api-config';
import { EntityDetailPage } from '../../../shared/entity-page/entity-detail-page/entity-detail-page';
import { EntityRow } from '../../../shared/entity-page/entity-field.model';
import { EntityListPage } from '../../../shared/entity-page/entity-list-page/entity-list-page';
import { createEmptyTenantDraft, TENANT_CREATE_FIELDS, TENANT_LIST_FIELDS } from './tenant.model';
import { TenantsService } from './tenants.service';

type DialogMode = 'create' | null;

@Component({
  selector: 'app-super-admin-tenants',
  imports: [EntityListPage, EntityDetailPage],
  host: { class: 'flex h-full min-h-0 flex-col gap-4' },
  providers: [provideIcons({ lucideBuilding2 })],
  templateUrl: './tenants.html',
  styleUrl: './tenants.scss',
})
export class Tenants implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly router = inject(Router);

  protected readonly rows = this.tenantsService.rows;

  protected readonly dialogMode = signal<DialogMode>(null);
  protected readonly editingRow = signal<EntityRow | null>(null);

  protected readonly createFields = TENANT_CREATE_FIELDS;
  protected readonly listFields = TENANT_LIST_FIELDS;

  protected readonly previewUrl = signal('');

  ngOnInit(): void {
    void this.tenantsService.load();
  }

  protected openCreate(): void {
    this.editingRow.set(createEmptyTenantDraft());
    this.previewUrl.set('');
    this.dialogMode.set('create');
  }

  protected onDraftChange(row: EntityRow): void {
    const slug = String(row['slug'] ?? '');
    this.previewUrl.set(slug ? tenantAppUrl(slug) : '');
  }

  protected openDetail(row: EntityRow): void {
    void this.router.navigateByUrl(`/super-admin/tenants/${row.id}`);
  }

  protected closeDialog(): void {
    this.dialogMode.set(null);
    this.editingRow.set(null);
  }

  protected async save(row: EntityRow): Promise<void> {
    await this.tenantsService.create(row);
    this.closeDialog();
  }
}
