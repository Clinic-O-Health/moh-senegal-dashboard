import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisedUsersComponent } from './supervised-users.component';

describe('SupervisedUsersComponent', () => {
  let component: SupervisedUsersComponent;
  let fixture: ComponentFixture<SupervisedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisedUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisedUsersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
