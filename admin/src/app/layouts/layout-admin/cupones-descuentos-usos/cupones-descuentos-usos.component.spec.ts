import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuponesDescuentosUsosComponent } from './cupones-descuentos-usos.component';

describe('CuponesDescuentosUsosComponent', () => {
  let component: CuponesDescuentosUsosComponent;
  let fixture: ComponentFixture<CuponesDescuentosUsosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuponesDescuentosUsosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuponesDescuentosUsosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
