import { Page404Component } from '../authentication/page404/page404.component';
import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TopicComponent } from './topic/topic.component';

import { NotesComponent } from './notes/notes.component';
import { SubtopicComponent } from './topic/subtopic/subtopic.component';
import { DeadlineComponent } from './deadline/deadline.component';
import { RevisionComponent } from './notes/revision/revision.component';
import { MockInterviewComponent } from './mock-interview/mock-interview.component';
import { ResoursesComponent } from './resourses/resourses.component';


export const STUDENT_ROUTE: Route[] = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'topic',
    component: TopicComponent,
  },
  {
    path: 'subtopic',
    component: SubtopicComponent,
  },
  {
    path: 'notes',
    component: NotesComponent,
  },
  {
    path: 'notes',
    component: NotesComponent,
  },
  {
    path: 'deadline',
    component: DeadlineComponent,
  },
  {
    path: 'due-revision',
    component: RevisionComponent,
  },
  {
    path: 'mock-interview',
    component: MockInterviewComponent,
  },
  {
    path: 'resources',
    component: ResoursesComponent,
  },
  { path: '**', component: Page404Component },
];
