import { TestBed } from '@angular/core/testing';

import { ProgressTrackerService } from './progress-tracker.service';

describe('ProgressTrackerService', () => {
  let service: ProgressTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
