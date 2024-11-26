import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertPaysComponent } from './insert-pays.component';

describe('InsertPaysComponent', () => {
  let component: InsertPaysComponent;
  let fixture: ComponentFixture<InsertPaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertPaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertPaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
