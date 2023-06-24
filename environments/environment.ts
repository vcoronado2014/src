// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //API_ENDPOINT: 'https://preapp.rayensalud.com/MiFamilia/Api/',
  //URL_FOTOS: 'https://preapp.rayensalud.com/MiFamilia/',
  //API_ENDPOINT: 'https://app.rayensalud.com/MiFamilia/Api/',
  //URL_FOTOS: 'https://app.rayensalud.com/MiFamilia/',
  API_ENDPOINT: 'http://190.151.14.104:1465/Api/',
  URL_FOTOS: 'http://190.151.14.104:1465/',
  //API_ENDPOINT: 'http://localhost:27563/Api/',
  //API_ENDPOINT: 'http://localhost:1960/Api/',
  //API_ENDPOINT: 'https://10.211.55.5:45456/Api/',
  //URL_FOTOS: 'http://localhost:27563/',
  //API_ENDPOINT: 'http://192.168.0.153/MiFamilia.WebApi/Api/',
  //URL_FOTOS: 'http://192.168.0.153/MiFamilia.WebApi/',
  //API_ENDPOINT: 'http://192.168.0.169/MiFamilia.WebApi/Api/',
  //URL_FOTOS: 'http://192.168.0.169/MiFamilia.WebApi/',
  API_KEY_MAPA: 'AIzaSyAqx2BInVZJP-xhUh5oSUgKSPh3rpB_Rzc',
  USA_CALENDARIO: false,
  HORAS_FECHA_INICIO: 3,
  TIEMPO_CONSULTA_NOTIFICACIONES: 2000
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
