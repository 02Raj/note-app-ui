import { Page404Component } from '../authentication/page404/page404.component';
import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TopicComponent } from './topic/topic.component';

import { NotesComponent } from './notes/notes.component';
import { SubtopicComponent } from './topic/subtopic/subtopic.component';


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
  { path: '**', component: Page404Component },
];
