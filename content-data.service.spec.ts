import { TestBed } from '@angular/core/testing';

import { ContentDataService } from './content-data.service';

describe('ContentDataService', () => {
  let service: ContentDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
