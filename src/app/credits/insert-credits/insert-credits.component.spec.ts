import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertCreditsComponent } from './insert-credits.component';

describe('InsertCreditsComponent', () => {
  let component: InsertCreditsComponent;
  let fixture: ComponentFixture<InsertCreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertCreditsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertCreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
