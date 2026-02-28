import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreScreeningsComponent } from './pre-screenings.component';

describe('PreScreeningsComponent', () => {
  let component: PreScreeningsComponent;
  let fixture: ComponentFixture<PreScreeningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreScreeningsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreScreeningsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
