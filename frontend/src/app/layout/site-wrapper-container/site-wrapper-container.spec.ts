import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteWrapperContainer } from './site-wrapper-container';

describe('SiteWrapperContainer', () => {
  let component: SiteWrapperContainer;
  let fixture: ComponentFixture<SiteWrapperContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteWrapperContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteWrapperContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
