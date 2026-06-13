import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Doctorsfull } from './doctorsfull';

describe('Doctorsfull', () => {
  let component: Doctorsfull;
  let fixture: ComponentFixture<Doctorsfull>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Doctorsfull],
    }).compileComponents();

    fixture = TestBed.createComponent(Doctorsfull);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
