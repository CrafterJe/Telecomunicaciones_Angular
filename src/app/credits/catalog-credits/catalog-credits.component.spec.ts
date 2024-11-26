import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogCreditsComponent } from './catalog-credits.component';

describe('CatalogCreditsComponent', () => {
  let component: CatalogCreditsComponent;
  let fixture: ComponentFixture<CatalogCreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCreditsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogCreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
