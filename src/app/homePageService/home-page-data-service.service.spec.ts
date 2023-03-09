import { TestBed } from '@angular/core/testing';

import { HomePageDataServiceService } from './home-page-data-service.service';

describe('HomePageDataServiceService', () => {
  let service: HomePageDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomePageDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
