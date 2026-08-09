import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousItems } from './miscellaneous-items';

describe('MiscellaneousItems', () => {
  let component: MiscellaneousItems;
  let fixture: ComponentFixture<MiscellaneousItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiscellaneousItems],
    }).compileComponents();

    fixture = TestBed.createComponent(MiscellaneousItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
