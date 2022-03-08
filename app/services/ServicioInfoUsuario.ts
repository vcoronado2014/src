import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { forkJoin } from 'rxjs';

@Injectable()
export class ServicioInfoUsuario{
    constructor(
        private http: HTTP,
        private httpClient: HttpClient
      ){ }

      getIndicadorValor(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'IndicadorValor';
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
      getIndicadorValorNative(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'IndicadorValor';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }

      getPresion(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'Presion';
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
      getPresionNative(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'Presion';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }

      getAlergias(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'Alergia';
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
      getAlergiasNative(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'Alergia';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }

      //metodos api management
      getIndicadorValorApi(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'IndicadorValorApi';
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
      getIndicadorValorNativeApi(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'IndicadorValorApi';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }
      getPresionApi(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'PresionApi';
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
      getPresionNativeApi(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'PresionApi';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }

      getAlergiasApi(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'AlergiaApi';
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
      getAlergiasNativeApi(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'AlergiaApi';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }

      //antecedentes morbidos y familiares
      postAntecedentesApi(uspId){
        const body = JSON.stringify({ UspId: uspId.toString() });

        let url = environment.API_ENDPOINT + 'AntecedentesApi';
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
      postAntecedentesNativeApi(uspId){
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
          "UspId": uspId.toString()
        };
    
        let url = environment.API_ENDPOINT + 'AntecedentesApi';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});
      }

      //todas las llamadas juntas
      entregaAntecedentesFork(uspId) {
        const body = JSON.stringify({
            UspId: uspId.toString(),
        });

        let url = environment.API_ENDPOINT + 'IndicadorValorApi';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        //indicador valor
        let data = this.httpClient.post(url, body, options);

        //llamada a las alergias
        let urlAlergia = environment.API_ENDPOINT + 'AlergiaApi';
        let dataAlergia = this.httpClient.post(urlAlergia, body, options);
        //antecdentes (morbidos, etc)
        let urlAntecedentes = environment.API_ENDPOINT + 'AntecedentesApi';
        let dataAntecedentes = this.httpClient.post(urlAntecedentes, body, options);


        return forkJoin([data, dataAlergia, dataAntecedentes]);
    }
    entregaAntecedentesNativeFork(uspId) {
      //realizar la llamada post nativa
      const headers = new Headers;
      const body =
      {
          "UspId": uspId.toString(),
      };

      //indicador valor
      let url = environment.API_ENDPOINT + 'IndicadorValorApi';
      //alergias
      let urlAlergias = environment.API_ENDPOINT + 'AlergiaApi';
      //antecdentes
      let urlAntecedentes = environment.API_ENDPOINT + 'AntecedentesApi';
      this.http.setDataSerializer('json');

      let data = this.http.post(url, body, {});
      let dataAlergia = this.http.post(urlAlergias, body, {});
      let dataAntecedentes = this.http.post(urlAntecedentes, body, {});

      return forkJoin([data, dataAlergia, dataAntecedentes]);

  }

    
}