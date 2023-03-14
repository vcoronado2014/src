import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { of } from 'rxjs';

import { ServicioUtiles } from './ServicioUtiles';

@Injectable()
export class ServicioInfoUsuario{
    constructor(
        private http: HTTP,
        private httpClient: HttpClient,
        private utiles: ServicioUtiles,
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
    var usuarioLogueado = this.utiles.entregaUsuarioLogueado();
    const body = JSON.stringify({
      UspId: uspId.toString(),
      UspIdLogueado: usuarioLogueado ? usuarioLogueado.Id.toString() : "0",
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
    var usuarioLogueado = this.utiles.entregaUsuarioLogueado();
    const headers = new Headers;
    const body =
    {
      "UspId": uspId.toString(),
      "UspIdLogueado": usuarioLogueado ? usuarioLogueado.Id.toString() : "0",
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

    //todas las llamadas juntas

    entregaAntecedentesNativeForkFlag(uspId, traeIndicadores, traeAlergias, traeRelevantes) {
      //realizar la llamada post nativa
      var usuarioLogueado = this.utiles.entregaUsuarioLogueado();
      const headers = new Headers;
      const body =
      {
        "UspId": uspId.toString(),
        "UspIdLogueado": usuarioLogueado ? usuarioLogueado.Id.toString() : "0",
      };
  
      //indicador valor
      let url = environment.API_ENDPOINT + 'IndicadorValorApi';
      //alergias
      let urlAlergias = environment.API_ENDPOINT + 'AlergiaApi';
      //antecdentes
      let urlAntecedentes = environment.API_ENDPOINT + 'AntecedentesApi';
      this.http.setDataSerializer('json');
  
      //let data = this.http.post(url, body, {});
      let data : any;
      if (traeIndicadores){
        data = this.http.post(url, body, {});
      }
      else{
        let retorno = {
          'IndicadorValorUsp': [],
          'RespuestaBase': {
            'CodigoMensaje': 0,
            'Mensaje': 'Exito'
          }
        };

        data = new HttpResponse({status: 200, body: retorno});
      }

      //let dataAlergia = this.http.post(urlAlergias, body, {});
      let dataAlergia : any;
      if (traeAlergias){
        dataAlergia = this.http.post(urlAlergias, body, {});
      }
      else{
        let retornoAlergia = {
          'AlergiasUsp': [],
          'RespuestaBase': {
            'CodigoMensaje': 0,
            'Mensaje': 'Exito'
          }
        };
        dataAlergia = new HttpResponse({status: 200, body: retornoAlergia});
      }

      //let dataAntecedentes = this.http.post(urlAntecedentes, body, {});
      let dataAntecedentes: any;
      if (traeRelevantes){
        dataAntecedentes = this.http.post(urlAntecedentes, body, {});
      }
      else{
        let retornoAntecedentes = {
          "Antecedentes": {
            "Familiares": {
              "Antecedente": []
            },
            "Personales": {
              "Antecedente": []
            }
          }
        };

        dataAntecedentes = new HttpResponse({status: 200, body: retornoAntecedentes});
      }


      //nuevo metodo ya que en native devuelve un error
      
  
      return forkJoin([data, dataAlergia, dataAntecedentes]);
  
    }

    entregaAntecedentesForkFlag(uspId, traeIndicadores, traeAlergias, traeRelevantes) {
      var usuarioLogueado = this.utiles.entregaUsuarioLogueado();
      const body = JSON.stringify({
        UspId: uspId.toString(),
        UspIdLogueado: usuarioLogueado ? usuarioLogueado.Id.toString() : "0",
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
      let data: any;

      if (traeIndicadores){
        data = this.httpClient.post(url, body, options);
      }
      else{
        let retorno = {
          'IndicadorValorUsp': [],
          'RespuestaBase': {
            'CodigoMensaje': 0,
            'Mensaje': 'Exito'
          }
        };
        data = of(retorno);
      }
     
  
      //llamada a las alergias
      let urlAlergia = environment.API_ENDPOINT + 'AlergiaApi';
      //let dataAlergia = this.httpClient.post(urlAlergia, body, options);
      let dataAlergia : any;
      if (traeAlergias){
        dataAlergia = this.httpClient.post(urlAlergia, body, options);
      }
      else{
        let retornoAlergia = {
          'AlergiasUsp': [],
          'RespuestaBase': {
            'CodigoMensaje': 0,
            'Mensaje': 'Exito'
          }
        };
        dataAlergia = of(retornoAlergia);
      }

      //antecdentes (morbidos, etc)
      let urlAntecedentes = environment.API_ENDPOINT + 'AntecedentesApi';
      //let dataAntecedentes = this.httpClient.post(urlAntecedentes, body, options);

      let dataAntecedentes : any;
      if(traeRelevantes){
        dataAntecedentes = this.httpClient.post(urlAntecedentes, body, options);
      }
      else {
        let retornoAntecedentes = {
          "Antecedentes": {
            "Familiares": {
              "Antecedente": []
            },
            "Personales": {
              "Antecedente": []
            }
          }
        };
        dataAntecedentes = of(retornoAntecedentes);
      }

  
  
      return forkJoin([data, dataAlergia, dataAntecedentes]);
    }

    //metodo nuevo por error presentado en native
    entregaAntecedentesNativeForkFlagNuevo(uspId, traeIndicadores, traeAlergias, traeRelevantes) {
      //realizar la llamada post nativa
      var usuarioLogueado = this.utiles.entregaUsuarioLogueado();
      const headers = new Headers;
      const body =
      {
        "UspId": uspId.toString(),
        "UspIdLogueado": usuarioLogueado ? usuarioLogueado.Id.toString() : "0",
      };
  
      //indicador valor
      let url = environment.API_ENDPOINT + 'IndicadorValorApi';
      //alergias
      let urlAlergias = environment.API_ENDPOINT + 'AlergiaApi';
      //antecdentes
      let urlAntecedentes = environment.API_ENDPOINT + 'AntecedentesApi';
      this.http.setDataSerializer('json');
  
      //let data = this.http.post(url, body, {});
      let data : any;
      if (traeIndicadores){
        data = this.http.post(url, body, {});
      }
      else{
        let retorno = {
          'IndicadorValorUsp': [],
          'RespuestaBase': {
            'CodigoMensaje': 0,
            'Mensaje': 'Exito'
          }
        };

        data = of(new HttpResponse({status: 200, body: retorno}));
      }

      //let dataAlergia = this.http.post(urlAlergias, body, {});
      let dataAlergia : any;
      if (traeAlergias){
        dataAlergia = this.http.post(urlAlergias, body, {});
      }
      else{
        let retornoAlergia = {
          'AlergiasUsp': [],
          'RespuestaBase': {
            'CodigoMensaje': 0,
            'Mensaje': 'Exito'
          }
        };
        dataAlergia = of(new HttpResponse({status: 200, body: retornoAlergia}));
      }

      //let dataAntecedentes = this.http.post(urlAntecedentes, body, {});
      let dataAntecedentes: any;
      if (traeRelevantes){
        dataAntecedentes = this.http.post(urlAntecedentes, body, {});
      }
      else{
        let retornoAntecedentes = {
          "Antecedentes": {
            "Familiares": {
              "Antecedente": []
            },
            "Personales": {
              "Antecedente": []
            }
          }
        };

        dataAntecedentes = of(new HttpResponse({status: 200, body: retornoAntecedentes}));
      }


      //nuevo metodo ya que en native devuelve un error
      
  
      return forkJoin([data, dataAlergia, dataAntecedentes]);
  
    }    

    
}