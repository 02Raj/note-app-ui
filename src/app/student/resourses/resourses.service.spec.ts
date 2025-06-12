import { TestBed } from '@angular/core/testing';

import { ResoursesService } from './resourses.service';

describe('ResoursesService', () => {
  let service: ResoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
