import { TestBed } from '@angular/core/testing';

import { TimelineStoreService } from './timeline-store.service';

describe('TimelineStoreService', () => {
  let service: TimelineStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
