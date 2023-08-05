import { TestBed } from '@angular/core/testing';

import { CuponesDescuentosUsosService } from './cupones-descuentos-usos.service';

describe('CuponesDescuentosUsosService', () => {
  let service: CuponesDescuentosUsosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuponesDescuentosUsosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
