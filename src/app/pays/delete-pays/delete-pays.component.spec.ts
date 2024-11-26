import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePaysComponent } from './delete-pays.component';

describe('DeletePaysComponent', () => {
  let component: DeletePaysComponent;
  let fixture: ComponentFixture<DeletePaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletePaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
