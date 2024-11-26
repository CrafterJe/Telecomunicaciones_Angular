import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertTransactionsComponent } from './insert-transactions.component';

describe('InsertTransactionsComponent', () => {
  let component: InsertTransactionsComponent;
  let fixture: ComponentFixture<InsertTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
