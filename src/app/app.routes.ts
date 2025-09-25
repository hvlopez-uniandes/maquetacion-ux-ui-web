import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { MainLayoutComponent } from './components/main-layout/main-layout';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AlarmsComponent } from './components/alarms/alarms';
import { AchievementsComponent } from './components/achievements/achievements';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'alarms', component: AlarmsComponent },
      { path: 'achievements', component: AchievementsComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
