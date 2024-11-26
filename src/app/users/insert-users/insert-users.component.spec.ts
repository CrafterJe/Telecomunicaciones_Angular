import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertUsersComponent } from './insert-users.component';

describe('InsertUsersComponent', () => {
  let component: InsertUsersComponent;
  let fixture: ComponentFixture<InsertUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
