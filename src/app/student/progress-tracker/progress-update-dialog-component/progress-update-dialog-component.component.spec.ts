import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressUpdateDialogComponentComponent } from './progress-update-dialog-component.component';

describe('ProgressUpdateDialogComponentComponent', () => {
  let component: ProgressUpdateDialogComponentComponent;
  let fixture: ComponentFixture<ProgressUpdateDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressUpdateDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressUpdateDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
