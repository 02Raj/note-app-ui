import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlinedialogComponent } from './deadlinedialog.component';

describe('DeadlinedialogComponent', () => {
  let component: DeadlinedialogComponent;
  let fixture: ComponentFixture<DeadlinedialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlinedialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeadlinedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
