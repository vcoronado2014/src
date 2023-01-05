import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
//nativos
import { AppVersion } from '@ionic-native/app-version/ngx'
import { Network } from '@ionic-native/network/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { Device } from '@ionic-native/device/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Pipes
import { CelsiusPipe } from '../app/pipes/toCelsius.pipe';
import { SplitPipe } from '../app/pipes/split.pipe';
import { MomentPipe } from '../app/pipes/fecha.pipe';
import { FilterPipe } from '../app/pipes/filter.pipe';
//servicios
import { ServicioUtiles } from './services/ServicioUtiles';
import { ServicioGeo } from './services/ServicioGeo';
import { ServicioAcceso } from './services/ServicioAcceso';
import { ServicioInfoUsuario } from './services/ServicioInfoUsuario';
import { ServicioImagen } from './services/ServicioImagen';
import { ServicioLaboratorio } from './services/ServicioLaboratorio';
import { ServicioCitas } from './services/ServicioCitas';
import { ServicioPaginacion } from './services/ServicioPaginacion';
import { ServicioNotificaciones } from './services/ServicioNotificaciones';
import { ServicioClaveUnica } from './services/ServicioClaveUnica';
import { ServicioParametrosApp } from './services/ServicioParametrosApp';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServicioFCM } from './services/ServicioFCM';
import { ServicioNotificacionesLocales } from './services/ServicioNotificacionesLocales';
import { NetworkService } from './services/network.service';
import { StorageService } from './services/StorageService';
/** componentes material  */
import { MatCardModule  } from '@angular/material/card';
import { MatButtonModule  } from '@angular/material/button';
import { MatFormFieldModule  } from '@angular/material/form-field';
import { MatInputModule  } from '@angular/material/input';
import { MatDatepickerModule  } from '@angular/material/datepicker';
import { MatSelectModule  } from '@angular/material/select'
import { MatIconModule  } from '@angular/material/icon';
import { MatAutocompleteModule  } from '@angular/material/autocomplete';
/* import { MatSelectModule  } from '@angular/material/select';
import { MatFormField  } from '@angular/material/form-field/form-field';
import { MatFormField  } from '@angular/material/form-field/label'; */
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { firebaseConfig } from '../environments/firebaseconfig';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { FirebaseMessaging } from '@ionic-native/firebase-messaging/ngx';
import { ComponentsModule } from './components/components.module';
//ionic storage
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';

//material datepicker
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { enterAnimation } from './animations/nav-animations';

@NgModule({
  declarations: [
    AppComponent,
    CelsiusPipe,
    SplitPipe,
    MomentPipe,
    FilterPipe,
  ],
  entryComponents: [],
  imports: [
    HttpClientModule,
    BrowserModule, 
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot({
      navAnimation: enterAnimation
    }), 
    AppRoutingModule,
    ComponentsModule, 
    BrowserAnimationsModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicStorageModule.forRoot({
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    })
  ],
  providers: [
    StatusBar,
    InAppBrowser,
    SplashScreen,
    AppVersion,
    Network,
    HTTP,
    Device,
    LocationAccuracy,
    Geolocation,
    ServicioUtiles,
    ServicioGeo,
    ServicioAcceso,
    ServicioInfoUsuario,
    ServicioImagen,
    ServicioLaboratorio,
    ServicioCitas,
    ServicioPaginacion,
    ServicioNotificaciones,
    ServicioNotificacionesLocales,
    NetworkService,
    StorageService,
    ServicioClaveUnica,
    ServicioParametrosApp,
    ServicioFCM,
    LaunchNavigator,
    LocalNotifications,
    FirebaseMessaging,
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
