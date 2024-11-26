import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogUsersComponent } from './catalog-users.component';

describe('CatalogUsersComponent', () => {
  let component: CatalogUsersComponent;
  let fixture: ComponentFixture<CatalogUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
