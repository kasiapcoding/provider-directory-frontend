import { Routes } from '@angular/router';
import { Doctorsfull } from './doctor/doctorsfull/doctorsfull';
import { Test } from './test/test';

export const routes: Routes = [
  { path: '', component: Doctorsfull },
  { path: 'test', component: Test }

];