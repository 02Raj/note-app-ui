import { TestBed } from '@angular/core/testing';

import { MockInterviewService } from './mock-interview.service';

describe('MockInterviewService', () => {
  let service: MockInterviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockInterviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
