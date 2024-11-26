import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogTransactionsComponent } from './catalog-transactions.component';

describe('CatalogTransactionsComponent', () => {
  let component: CatalogTransactionsComponent;
  let fixture: ComponentFixture<CatalogTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
