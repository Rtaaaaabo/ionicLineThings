import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';


const routes: Routes = [
  // {
  //   path: 'tabs',
  //   component: TabsPage,
  //   children: [
  //     {
  //       path: 'home',
  //       children: [
  //       ]
  //     }
  //   ]
  // }
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  // { path: 'about-tab', loadChildren: './about-tab/about-tab.module#AboutTabPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
