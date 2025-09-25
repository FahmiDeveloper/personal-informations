import { Routes } from '@angular/router';

import { LoginComponent } from './core/components/login/login.component';
import { RegisterComponent } from './core/components/register/register.component';
import { HomeComponent } from './core/components/home/home.component';

import { AnimesForDesktopComponent } from './animes/for-desktop/animes-for-desktop.component';
import { AnimesForTabletComponent } from './animes/for-tablet/animes-for-tablet.component';
import { AnimesForMobileComponent } from './animes/for-mobile/animes-for-mobile.component';

import { ClockingsForDesktopComponent } from './clockings/for-desktop/clockings-for-desktop.component';
import { ClockingsForTabletComponent } from './clockings/for-tablet/clockings-for-tablet.component';
import { ClockingsForMobileComponent } from './clockings/for-mobile/clockings-for-mobile.component';

import { DebtsForDesktopComponent } from './debts/for-desktop/debts-for-desktop.component';
import { DebtsForTabletComponent } from './debts/for-tablet/debts-for-tablet.component';
import { DebtsForMobileComponent } from './debts/for-mobile/debts-for-mobile.component';

import { SubjectDocumentsForDesktopComponent } from './documents/for-desktop/subjects-documents-for-desktop.component';
import { SubjectDocumentsForTabletComponent } from './documents/for-tablet/subjects-documents-for-tablet.component';
import { SubjectsDocumentsForMobileComponent } from './documents/for-mobile/subjects-documents-for-mobile.component';

import { ExpirationsForDesktopComponent } from './expirations/for-desktop/expirations-for-desktop.component';
import { ExpirationsForTabletComponent } from './expirations/for-tablet/expirations-for-tablet.component';
import { ExpirationsForMobileComponent } from './expirations/for-mobile/expirations-for-mobile.component';

import { FilesComponent } from './files/files.component';

import { ListUsersForDesktopComponent } from './list-users/for-desktop/list-users-for-desktop.component';
import { ListUsersForMobileComponent } from './list-users/for-mobile/list-users-for-mobile.component';

import { MedicationsForDesktopComponent } from './medications/for-desktop/medications-for-desktop.component';
import { MedicationsForTabletComponent } from './medications/for-tablet/medications-for-tablet.component';
import { MedicationsForMobileComponent } from './medications/for-mobile/medications-for-mobile.component';

import { MoviesForDesktopComponent } from './movies/for-desktop/movies-for-desktop.component';
import { MoviesForTabletComponent } from './movies/for-tablet/movies-for-tablet.component';
import { MoviesForMobileComponent } from './movies/for-mobile/movies-for-mobile.component';

import { NotesForDesktopComponent } from './notes/for-desktop/notes-for-desktop.component';
import { NotesForTabletComponent } from './notes/for-tablet/notes-for-tablet.component';
import { NotesForMobileComponent } from './notes/for-mobile/notes-for-mobile.component';

import { PasswordsForDesktopComponent } from './passwords/for-desktop/passwords-for-desktop.component';
import { PasswordsForTabletComponent } from './passwords/for-tablet/passwords-for-tablet.component';
import { PasswordsForMobileComponent } from './passwords/for-mobile/passwords-for-mobile.component';

import { SeriesForDesktopComponent } from './series/for-desktop/series-for-desktop.component';
import { SeriesForTabletComponent } from './series/for-tablet/series-for-tablet.component';
import { SeriesForMobileComponent } from './series/for-mobile/series-for-mobile.component';

import { ToDoListComponent } from './to-do-list/to-do-list.component';

import { RemindersForDesktopComponent } from './reminders/for-desktop/reminders-for-desktop.component';
import { RemindersForTabletComponent } from './reminders/for-tablet/reminders-for-tablet.component';
import { RemindersForMobileComponent } from './reminders/for-mobile/reminders-for-mobile.component';

import { NotificationsComponent } from './notifications/notifications.component';

import { AuthGuard } from './shared/services/auth.guard';
import { SharedResolver } from './shared/services/shared.resolver';

export const rootRouterConfig: Routes = [
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
  
  { path: 'home', component: HomeComponent,  resolve: { data: SharedResolver}},

  { path: 'animes-for-desktop', component: AnimesForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'animes-for-tablet', component: AnimesForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'animes-for-mobile', component: AnimesForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'clockings-for-desktop', component: ClockingsForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'clockings-for-tablet', component: ClockingsForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'clockings-for-mobile', component: ClockingsForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'debts-for-desktop', component: DebtsForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'debts-for-tablet', component: DebtsForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'debts-for-mobile', component: DebtsForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'documents-for-desktop', component: SubjectDocumentsForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'documents-for-tablet', component: SubjectDocumentsForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'documents-for-mobile', component: SubjectsDocumentsForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'expirations-for-desktop', component: ExpirationsForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'expirations-for-tablet', component: ExpirationsForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'expirations-for-mobile', component: ExpirationsForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'files', component: FilesComponent,  resolve: { data: SharedResolver}},

  { path: 'users-desktop', component: ListUsersForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'users-mobile', component: ListUsersForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'medications-for-desktop', component: MedicationsForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'medications-for-tablet', component: MedicationsForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'medications-for-mobile', component: MedicationsForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'movies-for-desktop', component: MoviesForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'movies-for-tablet', component: MoviesForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'movies-for-mobile', component: MoviesForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'notes-for-desktop', component: NotesForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'notes-for-tablet', component: NotesForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'notes-for-mobile', component: NotesForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'passwords-for-desktop', component: PasswordsForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'passwords-for-tablet', component: PasswordsForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'passwords-for-mobile', component: PasswordsForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'series-for-desktop', component: SeriesForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'series-for-tablet', component: SeriesForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'series-for-mobile', component: SeriesForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'to-do-list', component: ToDoListComponent,  resolve: { data: SharedResolver}},

  { path: 'reminders-for-desktop', component: RemindersForDesktopComponent,  resolve: { data: SharedResolver}},
  { path: 'reminders-for-tablet', component: RemindersForTabletComponent,  resolve: { data: SharedResolver}},
  { path: 'reminders-for-mobile', component: RemindersForMobileComponent,  resolve: { data: SharedResolver}},

  { path: 'notifications', component: NotificationsComponent,  resolve: { data: SharedResolver}}

];