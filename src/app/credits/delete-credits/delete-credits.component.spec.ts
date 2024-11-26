import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCreditsComponent } from './delete-credits.component';

describe('DeleteCreditsComponent', () => {
  let component: DeleteCreditsComponent;
  let fixture: ComponentFixture<DeleteCreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCreditsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
