import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';


export const ADMIN_ROUTE: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
  },
  // {
  //   path: 'topic',
  //   component: TopicComponent,
  // },
  // {
  //   path: 'topics',
  //   loadChildren: () =>
  //     import('./topics/topics.routes').then((m) => m.TOPICS_ROUTE),
  // },
  // {
  //   path: 'somnen',
  //   loadChildren: () =>
  //     import('./somnen/somnen.routes').then((m) => m.SOMNEN_ROUTE),
  // },
  { path: '**', component: Page404Component },
];
