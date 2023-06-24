import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import * as moment from 'moment';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { forkJoin } from 'rxjs';

@Injectable()
export class ServicioParametrosApp{


    constructor(
        public platform : Platform,
        public appVersion: AppVersion,
        public toast: ToastController,
        public device: Device,
        private http: HTTP,
        private httpClient: HttpClient
    ){
      //inicializamos los valores
      moment.locale('es');
  
    }

    HORAS_FECHA_INICIO = ()=>{
        let retorno = 3;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'HORAS_FECHA_INICIO');
                if (arrRetorno && arrRetorno.Id > 0){
                    retorno = parseInt(arrRetorno.Valor);
                }
            }
        } 
        return retorno;
    }
    USA_CLAVE_UNICA = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_CLAVE_UNICA');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                    retorno = true;
                }
            }
        } 
        return retorno;
    }
    USA_ENTIDAD_CONTRATANTE = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_ENTIDAD_CONTRATANTE');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                    retorno = true;
                }
            }
        } 
        return retorno;
    }
    USA_LOGIN_ENROLAMIENTO = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_LOGIN_ENROLAMIENTO');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                    retorno = true;
                }
            }
        } 
        return retorno;
    }
    USA_API_MANAGEMENT = ()=>{
        let retorno = true;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_API_MANAGEMENT');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                    retorno = true;
                }
            }
        } 
        return retorno;
    }
    USA_LOG_MODULOS = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_LOG_MODULOS');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                    retorno = true;
                }
            }
        } 
        return retorno;
    }
    DIAS_LOG_MODULOS = ()=>{
        let retorno = 3;
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'DIAS_LOG_MODULOS');
                if (arrRetorno && arrRetorno.Id > 0){
                    retorno = parseInt(arrRetorno.Valor);
                }
            }
        } 
        return retorno;
    }
    URL_ACEPTA_CONDICIONES = ()=>{
        let retorno = '#';
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'URL_ACEPTA_CONDICIONES');
                if (arrRetorno && arrRetorno.Id > 0){
                    retorno = arrRetorno.Valor;
                }
            }
        } 
        return retorno;
    }

    URL_POLITICAS_PRIVACIDAD = ()=>{
        let retorno = '#';
        if (localStorage.getItem('PARAMETROS_APP')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_APP'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'URL_POLITICAS_PRVACIDAD');
                if (arrRetorno && arrRetorno.Id > 0){
                    retorno = arrRetorno.Valor;
                }
            }
        } 
        return retorno;
    }

    getParametrosNodo() {
        var nodId = localStorage.getItem('UsuarioAps') ? JSON.parse(localStorage.getItem('UsuarioAps'))?.NodId : 0;
        let url = environment.API_ENDPOINT + 'ParametrosNodo?NodId=' + nodId;
        let data = this.httpClient.get(url, {});
        return data;
    }
    getParametrosNodoNative() {
        var nodId = localStorage.getItem('UsuarioAps') ? JSON.parse(localStorage.getItem('UsuarioAps'))?.NodId : 0;
        let url = environment.API_ENDPOINT + 'ParametrosNodo?NodId=' + nodId;
        let data = this.http.get(url, {}, {});
        return data;
    }
    getParametrosNodoNodId(nodId) {
        let url = environment.API_ENDPOINT + 'ParametrosNodo?NodId=' + nodId;
        let data = this.httpClient.get(url, {});
        return data;
    }
    getParametrosNodoNativeNodId(nodId) {
        let url = environment.API_ENDPOINT + 'ParametrosNodo?NodId=' + nodId;
        let data = this.http.get(url, {}, {});
        return data;
    }
    getParametrosNodoNodIdFork(nodos) {
        var arrDatos = [];

        let httpHeaders = new HttpHeaders({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");
    
        let options = { headers: httpHeaders };


        if (nodos && nodos.length > 0) {
          nodos.forEach(nodo => {

              let url = environment.API_ENDPOINT + 'ParametrosNodo?NodId=' + nodo.id;

              arrDatos.push(this.httpClient.get(url, {}));

          });
        }

        return forkJoin(arrDatos);

    }
    getParametrosNodoNodIdForkNative(nodos) {
      //realizar la llamada post nativa
      var arrDatos = [];
      const headers = new Headers;

      this.http.setDataSerializer('json');

      if (nodos && nodos.length > 0) {
        nodos.forEach(nodo => {
            let url = environment.API_ENDPOINT + 'ParametrosNodo?NodId=' + nodo.id;

            arrDatos.push(this.http.get(url, {}, {}));

        });
      }

      return forkJoin(arrDatos);

  }
    //parametros del nodo
    ENVIA_CORREO_CONTACTO = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'ENVIA_CORREO_CONTACTO');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                        retorno = true;
                }
            }
        } 
        return retorno;
    }
    URL_CORREO_CONTACTO = ()=>{
        let retorno = '';
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'URL_CORREO_CONTACTO');
                if (arrRetorno && arrRetorno.Id > 0){
                    retorno = arrRetorno.Valor;
                }
            }
        } 
        return retorno;
    }
    USA_CAPSULAS_EDUCATIVAS = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_CAPSULAS_EDUCATIVAS');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                        retorno = true;
                }
            }
        } 
        return retorno;
    }
    
    entregaMotivosContacto(){
        return localStorage.getItem('MOTIVOS_CONTACTO') ? JSON.parse(localStorage.getItem('MOTIVOS_CONTACTO')) : [];
    }

    ENVIA_CORREO_CITAS_EXTERNAS = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'ENVIA_CORREO_CITAS_EXTERNAS');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                        retorno = true;
                }
            }
        } 
        return retorno;
    }

    TIEMPO_EXPIRACION_TOKEN_FCM = ()=>{
        let retorno = 5;
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'TIEMPO_EXPIRACION_TOKEN_FCM');
                if (arrRetorno && arrRetorno.Id > 0){
                        retorno = parseInt(arrRetorno.Valor);
                }
            }
        } 
        return retorno;
    }

    USA_NOTIFICACION_FCM = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'USA_NOTIFICACION_FCM');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                        retorno = true;
                }
            }
        } 
        return retorno;
    }

    PERMITE_CITAR_OTROS_NODOS = ()=>{
        let retorno = false;
        if (localStorage.getItem('PARAMETROS_NODO')){
            let elementos = JSON.parse(localStorage.getItem('PARAMETROS_NODO'));
            if (elementos && elementos.length > 0){
                let arrRetorno = elementos.find(p=>p.Nombre == 'PERMITE_CITAR_OTROS_NODOS');
                if (arrRetorno && arrRetorno.Id > 0){
                    if (parseInt(arrRetorno.Valor) == 1)
                        retorno = true;
                }
            }
        } 
        return retorno;
    }

    OCULTA_BOTON_RESERVA = (parametrosNodo)=>{
        let retorno = false;
        if (parametrosNodo.ParametrosNodo && parametrosNodo.ParametrosNodo.length > 0){
            let arrRetorno = parametrosNodo.ParametrosNodo.find(p=>p.Nombre == 'OCULTA_BOTON_RESERVA');
            if (arrRetorno && arrRetorno.Id > 0){
                if (parseInt(arrRetorno.Valor) == 1)
                    retorno = true;
            }
        }
        return retorno;
    }

}