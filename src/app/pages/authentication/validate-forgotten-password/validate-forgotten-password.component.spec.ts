import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateForgottenPasswordComponent } from './validate-forgotten-password.component';

describe('ValidateForgottenPasswordComponent', () => {
  let component: ValidateForgottenPasswordComponent;
  let fixture: ComponentFixture<ValidateForgottenPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateForgottenPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateForgottenPasswordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
