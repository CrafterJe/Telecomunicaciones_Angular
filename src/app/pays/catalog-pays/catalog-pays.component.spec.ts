import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogPaysComponent } from './catalog-pays.component';

describe('CatalogPaysComponent', () => {
  let component: CatalogPaysComponent;
  let fixture: ComponentFixture<CatalogPaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogPaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
