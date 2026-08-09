import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { EntityDetailPage } from '../../../../shared/entity-page/entity-detail-page/entity-detail-page';
import { EntityRow } from '../../../../shared/entity-page/entity-field.model';
import { TENANT_EDIT_FIELDS, TenantRow } from '../tenant.model';
import { TenantFeatureStatus, TenantsService } from '../tenants.service';

@Component({
  selector: 'app-tenant-detail',
  imports: [RouterLink, NgIcon, EntityDetailPage],
  providers: [provideIcons({ lucideArrowLeft })],
  templateUrl: './tenant-detail.html',
  styleUrl: './tenant-detail.scss',
})
export class TenantDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantsService = inject(TenantsService);

  private tenantId!: string;

  protected readonly editFields = TENANT_EDIT_FIELDS;
  protected readonly tenant = signal<TenantRow | null>(null);
  protected readonly features = signal<TenantFeatureStatus[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('id')!;
    void this.loadAll();
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const [tenant, features] = await Promise.all([
        this.tenantsService.get(this.tenantId),
        this.tenantsService.listTenantFeatures(this.tenantId),
      ]);
      this.tenant.set(tenant);
      this.features.set(features);
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(row: EntityRow): Promise<void> {
    await this.tenantsService.update(this.tenantId, row);
    await this.loadAll();
  }

  protected backToList(): void {
    void this.router.navigateByUrl('/super-admin/tenants');
  }

  protected async toggleFeature(feature: TenantFeatureStatus): Promise<void> {
    const nextEnabled = !feature.enabled;
    await this.tenantsService.toggleFeature(this.tenantId, feature.key, nextEnabled);
    this.features.update((list) =>
      list.map((f) => (f.key === feature.key ? { ...f, enabled: nextEnabled } : f)),
    );
  }
}
