import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'v2',
  //   pathMatch: 'full',
  // },
  {
    path: 'v1',
    loadChildren: () => import('./v1/v1.module').then((m) => m.V1Module),
  },
  {
    path: '',
    loadChildren: () => import('./v2/v2.module').then((m) => m.V2Module),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
