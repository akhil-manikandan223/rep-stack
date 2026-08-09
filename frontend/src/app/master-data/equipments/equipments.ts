import { Component, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideDumbbell } from '@ng-icons/lucide';
import { EntityDetailPage } from '../../../shared/entity-page/entity-detail-page/entity-detail-page';
import { EntityRow } from '../../../shared/entity-page/entity-field.model';
import { EntityListPage } from '../../../shared/entity-page/entity-list-page/entity-list-page';
import { createEmptyEquipment, EQUIPMENT_FIELDS, Equipment } from './equipment.model';
import { EquipmentsService } from './equipments.service';

type DialogMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-equipments',
  imports: [EntityListPage, EntityDetailPage],
  // block + h-full: this component's host is a plain child of <main>, not a flex item, so it
  // has no height of its own by default — needed so the list page's "pin footer to bottom"
  // layout has a real height to fill instead of just shrink-wrapping its content.
  host: { class: 'flex h-full min-h-0 flex-col gap-4' },
  providers: [provideIcons({ lucideDumbbell })],
  templateUrl: './equipments.html',
  styleUrl: './equipments.scss',
})
export class Equipments {
  private readonly equipmentsService = inject(EquipmentsService);

  protected readonly fields = EQUIPMENT_FIELDS;
  protected readonly rows = this.equipmentsService.rows;

  protected readonly dialogMode = signal<DialogMode>(null);
  protected readonly editingRow = signal<EntityRow | null>(null);

  protected openCreate(): void {
    this.editingRow.set({ id: '', ...createEmptyEquipment() });
    this.dialogMode.set('create');
  }

  protected openEdit(row: EntityRow): void {
    this.editingRow.set(row);
    this.dialogMode.set('edit');
  }

  protected closeDialog(): void {
    this.dialogMode.set(null);
    this.editingRow.set(null);
  }

  protected save(row: EntityRow): void {
    if (this.dialogMode() === 'create') {
      const { id, ...dto } = row;
      this.equipmentsService.create(dto as Omit<Equipment, 'id'>);
    } else {
      this.equipmentsService.update(row.id, row as Partial<Equipment>);
    }
    this.closeDialog();
  }

  protected remove(row: EntityRow): void {
    this.equipmentsService.remove(row.id);
  }
}
