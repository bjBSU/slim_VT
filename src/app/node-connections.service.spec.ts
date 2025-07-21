import { TestBed } from '@angular/core/testing';

import { NodeConnectionsService } from './node-connections.service';

describe('NodeConnectionsService', () => {
  let service: NodeConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
