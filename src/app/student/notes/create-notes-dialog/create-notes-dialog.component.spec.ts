import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNotesDialogComponent } from './create-notes-dialog.component';

describe('CreateNotesDialogComponent', () => {
  let component: CreateNotesDialogComponent;
  let fixture: ComponentFixture<CreateNotesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNotesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
