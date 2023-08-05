import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuponesDescuentosComponent } from './cupones-descuentos.component';

describe('CuponesDescuentosComponent', () => {
  let component: CuponesDescuentosComponent;
  let fixture: ComponentFixture<CuponesDescuentosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuponesDescuentosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuponesDescuentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
