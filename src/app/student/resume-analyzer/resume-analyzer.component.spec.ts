import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeAnalyzerComponent } from './resume-analyzer.component';

describe('ResumeAnalyzerComponent', () => {
  let component: ResumeAnalyzerComponent;
  let fixture: ComponentFixture<ResumeAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
