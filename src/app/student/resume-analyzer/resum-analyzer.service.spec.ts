import { TestBed } from '@angular/core/testing';

import { ResumAnalyzerService } from './resum-analyzer.service';

describe('ResumAnalyzerService', () => {
  let service: ResumAnalyzerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResumAnalyzerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
