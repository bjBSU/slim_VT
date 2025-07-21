import { TestBed } from '@angular/core/testing';

import { ProcessDataService } from './process-data.service';

describe('ProcessDataService', () => {
  let service: ProcessDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
