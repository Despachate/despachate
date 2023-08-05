import { TestBed } from '@angular/core/testing';

import { HistorialCuponesService } from './historial-cupones.service';

describe('HistorialCuponesService', () => {
  let service: HistorialCuponesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistorialCuponesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
