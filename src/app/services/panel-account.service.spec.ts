import { TestBed } from '@angular/core/testing';

import { PanelAccountService } from './panel-account.service';

describe('PanelAccountService', () => {
  let service: PanelAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
