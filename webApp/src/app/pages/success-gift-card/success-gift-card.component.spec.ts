import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessGiftCardComponent } from './success-gift-card.component';

describe('SuccessGiftCardComponent', () => {
  let component: SuccessGiftCardComponent;
  let fixture: ComponentFixture<SuccessGiftCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessGiftCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessGiftCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
