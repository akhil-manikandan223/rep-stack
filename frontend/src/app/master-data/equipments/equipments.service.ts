import { Injectable } from '@angular/core';
import { EntityStore } from '../../../shared/entity-page/entity-store';
import { Equipment, EQUIPMENT_SEED } from './equipment.model';

@Injectable({ providedIn: 'root' })
export class EquipmentsService {
  private readonly store = new EntityStore<Equipment>(EQUIPMENT_SEED);

  readonly rows = this.store.rows;

  get(id: string): Equipment | undefined {
    return this.store.get(id);
  }

  create(dto: Omit<Equipment, 'id'>): Equipment {
    return this.store.create(dto);
  }

  update(id: string, dto: Partial<Equipment>): Equipment {
    return this.store.update(id, dto);
  }

  remove(id: string): void {
    this.store.remove(id);
  }
}
