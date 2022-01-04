import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ServicioGeo{
  constructor(
    private http: HTTP,
    private httpClient: HttpClient
  ){


  }
  getMapaNative(lat, lon){
    //ojo, esta llamada que indica 'ROOFTOP' y result_type=street_address retorna un punto exacto
    //para hacer que retorne un punto aproximado debe idicar solo location_type=APROXIMATE
    //Ver la siguiente url de la documentación https://developers.google.com/maps/documentation/geocoding/intro
    //let urlCorta = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon +'&location_type=ROOFTOP&result_type=street_address&key=' + environment.API_KEY_MAPA;
    let urlCorta = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon +'&location_type=APPROXIMATE&key=' + environment.API_KEY_MAPA;
    let data = this.http.get(urlCorta, {}, {});
    return data;
  }
  getMapaWeb(lat, lon){
    //https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=YOUR_API_KEY
    //&location_type=ROOFTOP&result_type=street_address
    //let url corta
    //let urlCorta = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon +'&location_type=ROOFTOP&result_type=street_address&key=' + environment.API_KEY_MAPA;
    //let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon +'&key=' + environment.API_KEY_MAPA;
    let urlCorta = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon +'&location_type=APPROXIMATE&key=' + environment.API_KEY_MAPA;
    let data = this.httpClient.get(urlCorta,{});
    return data;
  }
  getRegistroApp(idDispositivo){
    let url = environment.API_ENDPOINT + 'ObtenerRegistroApp?IdDispositivo=' + idDispositivo;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getRegistroAppNative(idDispositivo){
    let url = environment.API_ENDPOINT + 'ObtenerRegistroApp?IdDispositivo=' + idDispositivo;
    let data = this.http.get(url,{}, {});
    return data;
  }
  //ya viene en formato objeto
  postRegistro(objetoRegistro) {
    //realizar la llamada post a la api
    const body = JSON.stringify(objetoRegistro);

    let url = environment.API_ENDPOINT + 'RegistroApp';
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
  postRegistroNative(objetoRegistro) {
    //realizar la llamada post a la api
    const headers = new Headers;
    const body = objetoRegistro;


    let url = environment.API_ENDPOINT + 'RegistroApp';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});

  }
  //registro familia
  postRegistroFamilia(objetoRegistro) {
    //realizar la llamada post a la api
    const body = JSON.stringify(objetoRegistro);

    let url = environment.API_ENDPOINT + 'RegistroAppFamilia';
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
  postRegistroFamiliaNative(objetoRegistro) {
    //realizar la llamada post a la api
    const headers = new Headers;
    const body = objetoRegistro;


    let url = environment.API_ENDPOINT + 'RegistroAppFamilia';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});

  }
  getRegistroAppRun(run, idDispositivo){
    let url = environment.API_ENDPOINT + 'RegistroApp?Run=' + run + '&IdDispositivo=' + idDispositivo;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getRegistroAppNativeRun(run, idDispositivo){
    let url = environment.API_ENDPOINT + 'RegistroApp?Run=' + run + '&IdDispositivo=' + idDispositivo;
    let data = this.http.get(url,{}, {});
    return data;
  }
  getRegistroAppCorreoPassword(correo, password){
    let url = environment.API_ENDPOINT + 'RegistroAppFamilia?Correo=' + correo + '&Password=' + password;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getRegistroAppNativeCorreoPassword(correo, password){
    let url = environment.API_ENDPOINT + 'RegistroAppFamilia?Correo=' + correo + '&Password=' + password;
    let data = this.http.get(url,{}, {});
    return data;
  }
  verificaEnrolamiento(run){
    let url = environment.API_ENDPOINT + 'RegistroAppFamilia?Run=' + run;
    let data = this.httpClient.get(url,{});
    return data;
  }
  verificaEnrolamientoNative(run){
    let url = environment.API_ENDPOINT + 'RegistroAppFamilia?Run=' + run;
    let data = this.http.get(url,{}, {});
    return data;
  }
  postRecuperarClave(correo){
    const body = JSON.stringify({ Correo: correo });

    let url = environment.API_ENDPOINT + 'RecuperarClave';
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
  postRecuperarClaveNative(correo){
    //realizar la llamada post nativa
    const headers = new Headers;
    const body =
    {
      "Correo": correo
    };

    let url = environment.API_ENDPOINT + 'RecuperarClave';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});
  }
  //validacion clave unica
  getValidacionCU(run, state){
    let url = environment.API_ENDPOINT + 'RegistroClaveUnica?Run=' + run + '&State=' + state;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getValidacionCUNative(run, state){
    let url = environment.API_ENDPOINT + 'RegistroClaveUnica?Run=' + run + '&State=' + state;
    let data = this.http.get(url,{}, {});
    return data;
  }
  postValidacionClaveUnica(run, state){
    const body = JSON.stringify({ Run: run, State: state });

    let url = environment.API_ENDPOINT + 'RegistroClaveUnica';
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
  postValidacionClaveUnicaNative(run, state){
    //realizar la llamada post nativa
    const headers = new Headers;
    const body =
    {
      "Run": run,
      "State": state
    };

    let url = environment.API_ENDPOINT + 'RegistroClaveUnica';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});
  }
  postValidarCorreo(correo){
    const body = JSON.stringify({ Correo: correo });

    let url = environment.API_ENDPOINT + 'ValidaCorreo';
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
  postValidarCorreoNative(correo){
    //realizar la llamada post nativa
    const headers = new Headers;
    const body =
    {
      "Correo": correo
    };

    let url = environment.API_ENDPOINT + 'ValidaCorreo';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});
  }
  getParametros(esProduccion){
    let url = environment.API_ENDPOINT + 'ParametrosApp?EsProduccion=' + esProduccion;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getParametrosNative(esProduccion){
    let url = environment.API_ENDPOINT + 'ParametrosApp?EsProduccion=' + esProduccion;
    let data = this.http.get(url,{}, {});
    return data;
  }

  //LLAMADAS PARA CONTROLAR EL INICIO Y TERMINO DE LA SESSION EN LA APP
  postIngreso(objetoEntrada) {
    //realizar la llamada post a la api
    const body = JSON.stringify(
      {
        "IdDispositivo": objetoEntrada.Token,
        "VersionAppName": objetoEntrada.VersionAppName,
        "Plataforma": objetoEntrada.Plataforma,
        "VersionAppNumber": objetoEntrada.VersionAppNumber,
        "TipoOperacion": objetoEntrada.TipoOperacion,
        "Id": objetoEntrada.Id != null ? objetoEntrada.Id.toString() : '0',
      });

    let url = environment.API_ENDPOINT + 'RegistroSession';
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
  postIngresoNative(objetoEntrada){
    //realizar la llamada post nativa
    const headers = new Headers;
    const body =
    {
      "IdDispositivo": objetoEntrada.Token,
      "VersionAppName": objetoEntrada.VersionAppName,
      "Plataforma": objetoEntrada.Plataforma,
      "VersionAppNumber": objetoEntrada.VersionAppNumber,
      "TipoOperacion": objetoEntrada.TipoOperacion,
      "Id": objetoEntrada.Id != null ? objetoEntrada.Id.toString() : '0',
    };

    let url = environment.API_ENDPOINT + 'RegistroSession';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});
  }

  postMovimientoApp(rssId, modulo) {
    //realizar la llamada post a la api
    const body = JSON.stringify(
      {
        "RssId": rssId,
        "NombreModulo": modulo
      });

    let url = environment.API_ENDPOINT + 'MovimientosApp';
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
  postMovimientoAppNative(rssId, modulo){
    //realizar la llamada post nativa
    const headers = new Headers;
    const body =
    {
      "RssId": rssId,
      "NombreModulo": modulo,
    };

    let url = environment.API_ENDPOINT + 'MovimientosApp';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});
  }
  getMovimientos(cantidadDias, idDispositivo){
    let url = environment.API_ENDPOINT + 'MovimientosApp?CantidadDias=' + cantidadDias + '&IdDispositivo=' + idDispositivo;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getMovimientosNative(cantidadDias, idDispositivo){
    let url = environment.API_ENDPOINT + 'MovimientosApp?CantidadDias=' + cantidadDias + '&IdDispositivo=' + idDispositivo;
    let data = this.http.get(url,{}, {});
    return data;
  }
  //para informar persona
  postInformarPersona(run, nombreSocial, email, numeroTelefono, etiquetaTelefono) {
    //realizar la llamada post a la api
    const body = JSON.stringify(
      {
        "Run": run,
        "NombreSocial": nombreSocial,
        "Email": email,
        "NumeroTelefono": numeroTelefono,
        "EtiquetaTelefono": etiquetaTelefono
      });

    let url = environment.API_ENDPOINT + 'InformarPersona';
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
  postInformarPersonaNative(run, nombreSocial, email, numeroTelefono, etiquetaTelefono){
    //realizar la llamada post nativa
    const headers = new Headers;
    const body =
    {
      "Run": run,
      "NombreSocial": nombreSocial,
      "Email": email,
      "NumeroTelefono": numeroTelefono,
      "EtiquetaTelefono": etiquetaTelefono
    };

    let url = environment.API_ENDPOINT + 'InformarPersona';
    this.http.setDataSerializer('json');


    return this.http.post(url, body, {});
  }
  //contactabilidad
  getContactabilidad(run){
    let url = environment.API_ENDPOINT + 'Contactabilidad?run=' + run;
    let data = this.httpClient.get(url,{});
    return data;
  }
  getContactabilidadNative(run){
    let url = environment.API_ENDPOINT + 'Contactabilidad?run=' + run;
    let data = this.http.get(url,{}, {});
    return data;
  }
  //validaciones para el registro de usuario
  verificaEnrolamientoCompleto(run, fechaNacimiento, email){
    let url = environment.API_ENDPOINT + 'RegistroAppFamilia?Run=' + run + '&FechaNacimiento=' + fechaNacimiento + '&Email=' + email;
    let data = this.httpClient.get(url,{});
    return data;
  }
  verificaEnrolamientoCompletoNative(run, fechaNacimiento, email){
    let url = environment.API_ENDPOINT + 'RegistroAppFamilia?Run=' + run+ '&FechaNacimiento=' + fechaNacimiento + '&Email=' + email;
    let data = this.http.get(url,{}, {});
    return data;
  }
  validaCodigo(id, codigo, operacion){
    let url = environment.API_ENDPOINT + 'ValidarCodigo?Id=' + id.toString() + '&Codigo=' + codigo + '&Operacion=' + operacion;
    let data = this.httpClient.get(url,{});
    return data;
  }
  validaCodigoNative(id, codigo, operacion){
    let url = environment.API_ENDPOINT + 'ValidarCodigo?Id=' + id.toString() + '&Codigo=' + codigo + '&Operacion=' + operacion;
    let data = this.http.get(url,{}, {});
    return data;
  }
  //actualiza los datos de la familia
  actualizaFamilia(uspsIds, uspIdTitular){
    let url = environment.API_ENDPOINT + 'Familia?UspsIds=' + uspsIds + '&UspIdTitular=' + uspIdTitular;
    let data = this.httpClient.get(url,{});
    return data;
  }
  actualizaFamiliaNative(uspsIds, uspIdTitular){
    let url = environment.API_ENDPOINT + 'Familia?UspsIds=' + uspsIds + '&UspIdTitular=' + uspIdTitular;
    let data = this.http.get(url,{}, {});
    return data;
  }
  quitarFamilia(uspsIds, uspIdTitular){
    let url = environment.API_ENDPOINT + 'Familia?UspsIds=' + uspsIds + '&UspIdTitular=' + uspIdTitular + '&Operacion=quitar';
    let data = this.httpClient.get(url,{});
    return data;
  }
  quitarFamiliaNative(uspsIds, uspIdTitular){
    let url = environment.API_ENDPOINT + 'Familia?UspsIds=' + uspsIds + '&UspIdTitular=' + uspIdTitular + '&Operacion=quitar';
    let data = this.http.get(url,{}, {});
    return data;
  }
}