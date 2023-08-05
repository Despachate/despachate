// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  stripe_pk:
    'pk_test_51KFhD4KxNLkcjMb46sd2miSnFQ2ZZNajtHR0Yq4B6owkBsFWU331cKLunpSPL1vmpS36weMiUDm7jCA0U3Qzwy6X00a8jK4Ej7',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
export const URL_SERVICIOS = 'http://localhost:3000/';
// export const URL_IMGS = 'http://localhost:3000/imagenes/';
// export const URL_SERVICIOS = 'https://localhost.com.mx/node/';
export const URL_IMGS = 'https://despachate.com.mx/node/imagenes/';
//
export const firebaseConfig = {
  apiKey: 'AIzaSyBjMh9ACXaaK0bo1WO0nTsFyaPnrGLqVZM',
  authDomain: 'despachate-example.firebaseapp.com',
  projectId: 'despachate-example',
  storageBucket: 'despachate-example.appspot.com',
  messagingSenderId: '546793077576',
  appId: '1:546793077576:web:af77289aa34f26312d917d',
  measurementId: 'G-4NNNNYS9NT',
};
