import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ServicioLaboratorio{
    constructor(
        private http: HTTP,
        private httpClient: HttpClient
      ){ }

    getOrdenes(uspId) {
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'Ordenes';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }

    getOrdenesNative(uspId) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "UspId": uspId.toString()
        };

        let url = environment.API_ENDPOINT + 'Ordenes';
        this.http.setDataSerializer('json');


        return this.http.post(url, body, {});
    }

    getExamenes(oalaId) {
        const body = JSON.stringify({ OalaId: oalaId.toString() });

        let url = environment.API_ENDPOINT + 'Examenes';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }

    getExamenesNative(oalaId) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "OalaId": oalaId.toString()
        };

        let url = environment.API_ENDPOINT + 'Examenes';
        this.http.setDataSerializer('json');


        return this.http.post(url, body, {});
    }
}