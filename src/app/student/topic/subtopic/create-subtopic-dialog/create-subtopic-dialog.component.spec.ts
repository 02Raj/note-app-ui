import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubtopicDialogComponent } from './create-subtopic-dialog.component';

describe('CreateSubtopicDialogComponent', () => {
  let component: CreateSubtopicDialogComponent;
  let fixture: ComponentFixture<CreateSubtopicDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSubtopicDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSubtopicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
