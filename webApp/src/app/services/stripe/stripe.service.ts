import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  url: string = `${URL_SERVICIOS}stripe/`;
  constructor(private http: HttpClient) {}

  createSession(products: any[], compra: any) {
    return this.http.post(`${this.url}`, { products, compra }).pipe(
      map((res: any) => res),
      catchError((err: any) => {
        console.log(err);
        return throwError(err);
      })
    );
  }

  createSessionGiftCard(compra: any) {
    return this.http.post(`${this.url}giftCard/`, { compra }).pipe(
      map((res: any) => res),
      catchError((err: any) => {
        console.log(err);
        return throwError(err);
      })
    );
  }

  retriveSession(id: string) {
    return this.http.get(`${this.url}${id}`).pipe(
      map((res: any) => res),
      catchError((err: any) => {
        console.log(err);
        return throwError(err);
      })
    );
  }
}
