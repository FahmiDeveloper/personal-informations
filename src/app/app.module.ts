import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CustomFormsModule } from 'ng2-validation';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

import { AppRoutingModule } from './app-routing.module';
import { rootRouterConfig } from './app.routes';

import { environment } from 'src/environments/environment';

import { SortPipe } from './shared/pipes/sort.pipe';

import { AppComponent } from './app.component';

import { AngularMaterialModule } from './angular-material.module';

import { 
  HeaderComponent,
  HomeComponent,
  LoginComponent,
  RegisterComponent
} from './core/components/index';

import { 
  AnimesForDesktopComponent,
  AnimeFormDesktopComponent,
  AnimeDetailsWithSeasonsDesktopComponent,
  AnimesForTabletComponent,
  AnimeFormTabletComponent,
  AnimeDetailsWithSeasonsTabletComponent,
  AnimesForMobileComponent,
  AnimeFormMobileComponent,
  AnimeDetailsWithSeasonsMobileComponent
} from './animes/index';

import { 
  ClockingsForDesktopComponent,
  ClockingFormForDesktopComponent,
  ClockingsForTabletComponent,
  ClockingFormForTabletComponent,
  ClockingsForMobileComponent,
  ClockingFormForMobileComponent
} from './clockings/index';

import { 
  DebtsForDesktopComponent,
  DebtFormForDesktopComponent,
  DebtsForTabletComponent,
  DebtFormForTabletComponent,
  DebtsForMobileComponent,
  DebtFormForMobileComponent
} from './debts/index';

import { 
  SubjectDocumentsForDesktopComponent,
  SubjectDocumentsFormDesktopComponent,
  DocumentsListForDesktopComponent,
  DocumentFormDesktopComponent,
  SubjectDocumentsForTabletComponent,
  SubjectDocumentsFormTabletComponent,
  DocumentsListForTabletComponent,
  DocumentFormTabletComponent,
  SubjectsDocumentsForMobileComponent,
  SubjectDocumentsFormMobileComponent,
  DocumentsListForMobileComponent,
  DocumentFormMobileComponent
} from './documents/index';

import { 
  ExpirationsForDesktopComponent,
  ExpirationFormForDesktopComponent,
  ExpirationsForTabletComponent,
  ExpirationFormForTabletComponent,
  ExpirationsForMobileComponent,
  ExpirationFormForMobileComponent
} from './expirations/index';

import { 
  FilesComponent,
  UploadFormComponent,
  UploadListComponent,
  UploadDetailsComponent,
  NewOrEditLinkComponent
} from './files/index';

import { 
  ListUsersForDesktopComponent,
  ModalPrivilegeDesktopComponent,
  ListUsersForMobileComponent,
  ModalPrivilegeMobileComponent
} from './list-users/index';

import { 
  MedicationsForDesktopComponent,
  MedicationFormForDesktopComponent,
  MedicationsForTabletComponent,
  MedicationFormForTabletComponent,
  MedicationsForMobileComponent,
  MedicationFormForMobileComponent
} from './medications/index';

import { 
  MoviesForDesktopComponent,
  MovieFormDesktopComponent,
  MovieDetailsWithPartsDesktopComponent,
  MoviesForTabletComponent,
  MovieFormTabletComponent,
  MovieDetailsWithPartsTabletComponent,
  MoviesForMobileComponent,
  MovieFormMobileComponent,
  MovieDetailsWithPartsMobileComponent
} from './movies/index';

import { 
  NotesForDesktopComponent,
  NoteFormDesktopComponent,
  NotesForTabletComponent,
  NoteFormForTabletComponent,
  NotesForMobileComponent,
  NoteFormMobileComponent
} from './notes/index';

import { 
  PasswordsForDesktopComponent,
  PasswordFormForDesktopComponent,
  PasswordsForTabletComponent,
  PasswordFormForTabletComponent,
  PasswordsForMobileComponent,
  PasswordFormForMobileComponent,
} from './passwords/index';

import { 
  SeriesForDesktopComponent,
  SerieFormDesktopComponent,
  SerieDetailsWithSeasonsDesktopComponent,
  SeriesForTabletComponent,
  SerieFormTabletComponent,
  SerieDetailsWithSeasonsTabletComponent,
  SeriesForMobileComponent,
  SerieFormMobileComponent,
  SerieDetailsWithSeasonsMobileComponent
} from './series/index';

import { 
  ToDoListComponent,
  TaskFormComponent,
} from './to-do-list/index';

import { 
  RemindersForDesktopComponent,
  ReminderFormForDesktopComponent,
  RemindersForTabletComponent,
  ReminderFormForTabletComponent,
  RemindersForMobileComponent,
  ReminderFormForMobileComponent
} from './reminders/index';

import { NotificationsComponent } from './notifications/index';

import { MaterialElevationDirective } from './shared/directives/material-elevation.directive';

import { BodyComponent } from './body/body.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SublevelMenuComponent } from './sidenav/sublevel-menu.component';
import { AppMobileComponent } from './app-mobile/app-mobile.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    FormsModule,
    DragDropModule,
    OverlayModule,
    ReactiveFormsModule,
    PdfViewerModule,
    NgbModule,
    NgxPaginationModule,
    CustomFormsModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireMessagingModule,
    // ServiceWorkerModule.register('firebase-messaging-sw.js', { enabled: environment.production, registrationStrategy: 'registerWhenStable:30000' }),
    AngularFireStorageModule,
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    NgxDocViewerModule, 
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule
  ],
  declarations: [
    AppComponent,
    AppMobileComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    SortPipe,

    AnimesForDesktopComponent,
    AnimeFormDesktopComponent,
    AnimeDetailsWithSeasonsDesktopComponent,
    AnimesForTabletComponent,
    AnimeFormTabletComponent,
    AnimeDetailsWithSeasonsTabletComponent,
    AnimesForMobileComponent,
    AnimeFormMobileComponent,
    AnimeDetailsWithSeasonsMobileComponent,

    ClockingsForDesktopComponent,
    ClockingFormForDesktopComponent,
    ClockingsForTabletComponent,
    ClockingFormForTabletComponent,
    ClockingsForMobileComponent,
    ClockingFormForMobileComponent,

    DebtsForDesktopComponent,
    DebtFormForDesktopComponent,
    DebtsForTabletComponent,
    DebtFormForTabletComponent,
    DebtsForMobileComponent,
    DebtFormForMobileComponent,

    SubjectDocumentsForDesktopComponent,
    SubjectDocumentsFormDesktopComponent,
    DocumentsListForDesktopComponent,
    DocumentFormDesktopComponent,
    SubjectDocumentsForTabletComponent,
    SubjectDocumentsFormTabletComponent,
    DocumentsListForTabletComponent,
    DocumentFormTabletComponent,
    SubjectsDocumentsForMobileComponent,
    SubjectDocumentsFormMobileComponent,
    DocumentsListForMobileComponent,
    DocumentFormMobileComponent,

    ExpirationsForDesktopComponent,
    ExpirationFormForDesktopComponent,
    ExpirationsForTabletComponent,
    ExpirationFormForTabletComponent,
    ExpirationsForMobileComponent,
    ExpirationFormForMobileComponent,

    FilesComponent,
    UploadFormComponent,
    UploadListComponent,
    UploadDetailsComponent,
    NewOrEditLinkComponent,

    ListUsersForDesktopComponent,
    ModalPrivilegeDesktopComponent,
    ListUsersForMobileComponent,
    ModalPrivilegeMobileComponent,

    MedicationsForDesktopComponent,
    MedicationFormForDesktopComponent,
    MedicationsForTabletComponent,
    MedicationFormForTabletComponent,
    MedicationsForMobileComponent,
    MedicationFormForMobileComponent,

    MoviesForDesktopComponent,
    MovieFormDesktopComponent,
    MovieDetailsWithPartsDesktopComponent,
    MoviesForTabletComponent,
    MovieFormTabletComponent,
    MovieDetailsWithPartsTabletComponent,
    MoviesForMobileComponent,
    MovieFormMobileComponent,
    MovieDetailsWithPartsMobileComponent,

    NotesForDesktopComponent,
    NoteFormDesktopComponent,
    NotesForTabletComponent,
    NoteFormForTabletComponent,
    NotesForMobileComponent,
    NoteFormMobileComponent,

    PasswordsForDesktopComponent,
    PasswordFormForDesktopComponent,
    PasswordsForTabletComponent,
    PasswordFormForTabletComponent,
    PasswordsForMobileComponent,
    PasswordFormForMobileComponent,

    SeriesForDesktopComponent,
    SerieFormDesktopComponent,
    SerieDetailsWithSeasonsDesktopComponent,
    SeriesForTabletComponent,
    SerieFormTabletComponent,
    SerieDetailsWithSeasonsTabletComponent,
    SeriesForMobileComponent,
    SerieFormMobileComponent,
    SerieDetailsWithSeasonsMobileComponent,

    ToDoListComponent,
    TaskFormComponent,

    RemindersForDesktopComponent,
    ReminderFormForDesktopComponent,
    RemindersForTabletComponent,
    ReminderFormForTabletComponent,
    RemindersForMobileComponent,
    ReminderFormForMobileComponent,

    NotificationsComponent,

    BodyComponent,
    SidenavComponent,
    SublevelMenuComponent,

    MaterialElevationDirective
  ],
  entryComponents: [],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }