import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ServicioUtiles } from './ServicioUtiles';
import * as moment from 'moment';

@Injectable()
export class ServicioClaveUnica {

    constructor(
        private http: HTTP,
        private httpClient: HttpClient,
        private utiles: ServicioUtiles,
    ) { }

    //Obtiene el formulario de login
    getLogin() {
        let urlCorta = environment.API_ENDPOINT + 'ClaveUnicaBefore';
        let data = this.httpClient.get(urlCorta, { responseType: 'text' });
        return data;
    }
    //obtiene el formulario de login nativo
    getLoginNative() {
        let urlCorta = environment.API_ENDPOINT + 'ClaveUnicaBefore';
        let data = this.http.get(urlCorta, { }, {});
        return data;
    }
    postConfiguracionClaveUnica(esProduccion){
        const body = JSON.stringify({ EsProduccion: esProduccion });
    
        let url = environment.API_ENDPOINT + 'ConfiguracionClaveUnica';
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
      postConfiguracionClaveUnicaNative(esProduccion){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "EsProduccion": esProduccion
        };
    
        let url = environment.API_ENDPOINT + 'ConfiguracionClaveUnica';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }  

}