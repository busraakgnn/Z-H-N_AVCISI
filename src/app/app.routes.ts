import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map.page').then((m) => m.MapPage),
  },
  {
    // PARAMETREYİ SİLDİK: Sadece 'quiz' yaptık çünkü verileri queryParams ile gönderiyoruz
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz.page').then((m) => m.QuizPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];