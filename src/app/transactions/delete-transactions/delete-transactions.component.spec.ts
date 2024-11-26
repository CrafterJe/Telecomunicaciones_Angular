import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTransactionsComponent } from './delete-transactions.component';

describe('DeleteTransactionsComponent', () => {
  let component: DeleteTransactionsComponent;
  let fixture: ComponentFixture<DeleteTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
