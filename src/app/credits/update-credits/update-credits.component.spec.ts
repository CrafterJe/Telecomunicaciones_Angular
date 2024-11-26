import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCreditsComponent } from './update-credits.component';

describe('UpdateCreditsComponent', () => {
  let component: UpdateCreditsComponent;
  let fixture: ComponentFixture<UpdateCreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCreditsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
