import { TestBed } from '@angular/core/testing';

import { TangleLayoutService } from './tangle-layout.service';

describe('TangleLayoutService', () => {
  let service: TangleLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TangleLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
