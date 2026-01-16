import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgottenPasswordComponent } from './forgotten-password.component';

describe('ForgottenPasswordComponent', () => {
  let component: ForgottenPasswordComponent;
  let fixture: ComponentFixture<ForgottenPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgottenPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgottenPasswordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
