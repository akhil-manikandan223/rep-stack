import {
  Component,
  effect,
  inject,
  input,
  Injector,
  linkedSignal,
  OnInit,
  output,
  runInInjectionContext,
  WritableSignal,
} from '@angular/core';
import { disabled, FieldTree, FormField, form, required } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { EntityField, EntityRow } from '../entity-field.model';

@Component({
  selector: 'app-entity-detail-page',
  imports: [FormField, HlmButtonImports, HlmFieldImports, HlmInputImports],
  templateUrl: './entity-detail-page.html',
  styleUrl: './entity-detail-page.scss',
})
export class EntityDetailPage implements OnInit {
  readonly fields = input.required<EntityField[]>();
  readonly initialValue = input.required<EntityRow>();

  readonly save = output<EntityRow>();
  readonly cancel = output<void>();
  /** Emits the draft's current value on every change, before it's saved. */
  readonly valueChange = output<EntityRow>();

  private readonly injector = inject(Injector);

  // form()'s schema callback runs synchronously as soon as form() is called (and form() itself
  // calls inject() internally), so it can't be built in a field initializer/constructor —
  // required inputs aren't bound yet at that point. ngOnInit is the first point Angular
  // guarantees inputs are set, but ngOnInit isn't itself an injection context, so form() is
  // run explicitly inside the Injector captured safely back at construction time.
  protected model!: WritableSignal<EntityRow>;
  protected entityForm!: FieldTree<EntityRow>;

  ngOnInit(): void {
    this.model = linkedSignal(() => this.initialValue());
    this.entityForm = runInInjectionContext(this.injector, () =>
      form(this.model, (path) => {
        for (const field of this.fields()) {
          if (field.required) {
            required(path[field.prop], { message: `${field.label} is required` });
          }
          const cascadeFrom = field.lookup?.cascadeFrom;
          if (cascadeFrom) {
            disabled(path[field.prop], { when: (ctx) => !ctx.valueOf(path[cascadeFrom]) });
          }
        }
      }),
    );
    runInInjectionContext(this.injector, () => effect(() => this.valueChange.emit(this.model())));
  }

  protected lookupOptions(field: EntityField) {
    const cascadeFrom = field.lookup?.cascadeFrom;
    if (!cascadeFrom) return field.lookup?.options() ?? [];
    const parentValue = this.entityForm[cascadeFrom]().value();
    if (!parentValue) return [];
    return field.lookup?.options(parentValue) ?? [];
  }

  protected onSave(): void {
    if (this.entityForm().invalid()) return;
    this.save.emit(this.model());
  }
}
