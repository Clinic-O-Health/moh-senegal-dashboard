import { Route } from "@angular/router";
import { NotFoundComponent } from "./not-found/not-found.component";
import { UnauthorizedComponent } from "./unauthorized/unauthorized.component";

export const ERROR_ROUTES: Route[] = [
  { path: '', component: UnauthorizedComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '404', component: NotFoundComponent }
];
