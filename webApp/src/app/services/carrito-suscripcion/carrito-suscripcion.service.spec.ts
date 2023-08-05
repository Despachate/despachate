import { TestBed } from '@angular/core/testing';

import { CarritoSuscripcionService } from './carrito-suscripcion.service';

describe('CarritoSuscripcionService', () => {
  let service: CarritoSuscripcionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarritoSuscripcionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
