import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkersComponent } from './workers.component';

describe('WorkersComponent', () => {
  let component: WorkersComponent;
  let fixture: ComponentFixture<WorkersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
