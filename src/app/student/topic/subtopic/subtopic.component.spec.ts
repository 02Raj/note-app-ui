import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtopicComponent } from './subtopic.component';

describe('SubtopicComponent', () => {
  let component: SubtopicComponent;
  let fixture: ComponentFixture<SubtopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtopicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
