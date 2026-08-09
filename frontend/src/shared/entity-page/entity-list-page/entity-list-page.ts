import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlignJustify,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideChevronsUpDown,
  lucideChevronUp,
  lucideHome,
  lucideLightbulb,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSettings,
  lucideTable2,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { EntityField, EntityRow, EntityValue, isFilterableField, isSortableField } from '../entity-field.model';

type SortDirection = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const MAX_PAGE_BUTTONS = 5;

function compareValues(a: EntityValue, b: EntityValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

@Component({
  selector: 'app-entity-list-page',
  imports: [NgIcon, HlmButtonImports, HlmInputImports, HlmTableImports],
  providers: [
    provideIcons({
      lucideAlignJustify,
      lucideCheck,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
      lucideChevronUp,
      lucideChevronsUpDown,
      lucideHome,
      lucideLightbulb,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideSettings,
      lucideTable2,
      lucideTrash2,
    }),
  ],
  templateUrl: './entity-list-page.html',
  styleUrl: './entity-list-page.scss',
})
export class EntityListPage {
  readonly fields = input.required<EntityField[]>();
  readonly rows = input.required<EntityRow[]>();
  readonly title = input('');
  /** Name of an icon registered (via provideIcons) by this component or an ancestor. */
  readonly icon = input('lucideHome');
  readonly allowDelete = input(true);
  readonly allowCreate = input(true);
  readonly allowEdit = input(true);

  readonly create = output<void>();
  readonly edit = output<EntityRow>();
  readonly delete = output<EntityRow>();

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected readonly quickSearch = signal('');
  protected readonly showFilters = signal(false);
  protected readonly columnFilters = signal<Record<string, string>>({});
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDir = signal<SortDirection>('asc');
  protected readonly page = signal(0);
  protected readonly pageSize = signal(50);

  protected readonly isFilterable = isFilterableField;

  protected readonly visibleRows = computed(() => {
    let result = this.rows();

    const query = this.quickSearch().trim().toLowerCase();
    if (query) {
      const stringFields = this.fields().filter((field) => field.type === 'string');
      result = result.filter((row) =>
        stringFields.some((field) => String(row[field.prop] ?? '').toLowerCase().includes(query)),
      );
    }

    const activeFilters = Object.entries(this.columnFilters()).filter(([, value]) => value);
    if (activeFilters.length) {
      result = result.filter((row) =>
        activeFilters.every(([prop, value]) =>
          String(row[prop] ?? '')
            .toLowerCase()
            .includes(value.toLowerCase()),
        ),
      );
    }

    const key = this.sortKey();
    if (key) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => compareValues(a[key], b[key]) * dir);
    }

    return result;
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.visibleRows().length / this.pageSize())),
  );

  protected readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));

  protected readonly pagedRows = computed(() => {
    const rows = this.visibleRows();
    const start = this.currentPage() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  protected readonly pageNumbers = computed(() => {
    const pageCount = this.pageCount();
    const current = this.currentPage();
    const windowSize = Math.min(MAX_PAGE_BUTTONS, pageCount);
    let start = Math.max(0, current - Math.floor(windowSize / 2));
    start = Math.min(start, pageCount - windowSize);
    return Array.from({ length: windowSize }, (_, i) => start + i);
  });

  protected sortBy(field: EntityField): void {
    if (!isSortableField(field)) return;
    if (this.sortKey() === field.prop) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(field.prop);
      this.sortDir.set('asc');
    }
    this.page.set(0);
  }

  protected setColumnFilter(prop: string, value: string): void {
    this.columnFilters.update((current) => ({ ...current, [prop]: value }));
    this.page.set(0);
  }

  protected onQuickSearchChange(value: string): void {
    this.quickSearch.set(value);
    this.page.set(0);
  }

  protected setPageSize(size: string): void {
    this.pageSize.set(Number(size));
    this.page.set(0);
  }

  protected goToPage(page: number): void {
    this.page.set(Math.max(0, Math.min(page, this.pageCount() - 1)));
  }

  protected resetView(): void {
    this.quickSearch.set('');
    this.columnFilters.set({});
    this.sortKey.set(null);
    this.sortDir.set('asc');
    this.page.set(0);
  }

  protected displayValue(field: EntityField, row: EntityRow): string {
    const value = row[field.prop];
    switch (field.type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : '';
      case 'enum': {
        const match = field.enumOptions?.find((option) => option.value === value);
        return match?.label ?? '';
      }
      case 'select': {
        const options = field.lookup?.options() ?? [];
        const match = options.find((option) => option.id === value);
        return match?.name ?? '';
      }
      default:
        return value == null ? '' : String(value);
    }
  }
}
