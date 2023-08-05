import { Injectable } from '@angular/core';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { URL_SERVICIOS } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SubirArchivosService {
  @BlockUI() blockUI: NgBlockUI;
  constructor(private _toastService: ToastService) {}

  subirArchivo(
    archivos: File[],
    tipo: string,
    id: string,
    blockUI: NgBlockUI = this.blockUI,
    _toastService: ToastService = this._toastService
  ) {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      let xhr = new XMLHttpRequest();
      let index: number = 0;
      for (const archivo of archivos) {
        index++;
        formData.append(`imagen${index}`, archivo, archivo.name);
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('Imagen subida');
            console.log(xhr.response);
            blockUI.stop();
            _toastService.showNotification(
              'top',
              'center',
              'success',
              'Se subio el archivo correctamente'
            );
            resolve(JSON.parse(xhr.response));
          } else {
            console.log('Fallo la subida');
            console.log(xhr.response);
            let response = JSON.parse(xhr.response);
            blockUI.stop();
            _toastService.showNotification(
              'top',
              'center',
              'danger',
              'Ocurrio un error al subir archivo'
            );
            console.log(response.mensaje);
            if (!!response.mensaje) {
              _toastService.showNotification(
                'top',
                'center',
                'danger',
                response.mensaje
              );
            }
            console.log(response.errors.message);
            if (!!response.errors.message) {
              _toastService.showNotification(
                'top',
                'center',
                'danger',
                response.errors.message
              );
            }
            reject(xhr.response);
          }
        }
      };

      let url = URL_SERVICIOS + 'upload/' + tipo + '/' + id;

      xhr.open('PUT', url, true);
      xhr.send(formData);
    });
  }
  // subirTela( archivos: File[], tipo: string, id: string, paramName:string, param: string,blockUI: NgBlockUI = this.blockUI ) {

  //   return new Promise( (resolve, reject ) => {

  //     let formData = new FormData();
  //     let xhr = new XMLHttpRequest();
  //     let index: number = 0;
  //     for (const archivo of archivos) {
  //       index++;
  //       formData.append( `imagen${index}`, archivo, archivo.name );
  //     }

  //     xhr.onreadystatechange = function() {

  //       if ( xhr.readyState === 4 ) {

  //         if ( xhr.status === 200 ) {
  //           console.log( 'Imagen subida' );
  //           console.log(xhr.response);
  //           blockUI.stop();
  //           resolve( JSON.parse( xhr.response ) );
  //         } else {
  //           console.log( 'Fallo la subida' );
  //           console.log(xhr.response);
  //           blockUI.stop();
  //           reject( xhr.response );
  //         }

  //       }
  //     };

  //     let url = `${URL_SERVICIOS}upload/${tipo}/${id}?${paramName}=${param}`;

  //     xhr.open('PUT', url, true );
  //     xhr.send( formData );

  //   });
  // }
}
