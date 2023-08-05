import { TestBed } from '@angular/core/testing';

import { CuponesDescuentosService } from './cupones-descuentos.service';

describe('CuponesDescuentosService', () => {
  let service: CuponesDescuentosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuponesDescuentosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
