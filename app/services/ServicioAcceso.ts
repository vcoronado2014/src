import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()

export class ServicioAcceso{
    username: string;
    loggedIn: boolean;
    CodigoMensaje: any;
    Mensaje: string;
  
    constructor(
        private http: HTTP,
        private httpClient: HttpClient
    ){
      //inicializamos los valores
      this.username = '';
      this.loggedIn = false;
      this.CodigoMensaje = 0;
      this.Mensaje = '';
  
    }

    loginWeb(userInfo){
        var url = environment.API_ENDPOINT + 'Autentificacion?UserName=' + userInfo.UserName + '&Password=' + userInfo.Password;

        //return this.http.get(url, {}, {}).map(res => res.text()).map(res => { });
        return this.httpClient.get(url,{}).subscribe((response: any)=>{
            var retorno = response;
            //el response trae RespuestaBase
            if (retorno.RespuestaBase){
                if (retorno.RespuestaBase.CodigoMensaje == 0){
                    //todo ok por aca
                    var user;
                    var userFamilia;
                    if (retorno.UsuarioAps){
                      user = JSON.stringify(retorno.UsuarioAps);
                      //variable de sessión muy importante para el resto de la app.
                      sessionStorage.setItem("UsuarioAps", user);                 
                    }
                    if (retorno.UsuariosFamilia){
                      userFamilia = JSON.stringify(retorno.UsuariosFamilia);
                      //variable de sessión muy importante para el resto de la app.
                      localStorage.setItem("UsuariosFamilia", userFamilia);
                    }
    
    
                    this.CodigoMensaje = retorno.RespuestaBase.CodigoMensaje;
                    this.Mensaje = retorno.RespuestaBase.Mensaje;
    
                    this.username = userInfo.usuario;
                    this.loggedIn = true;
                }
                else {
                    this.loggedIn = false;
                    this.CodigoMensaje = retorno.RespuestaBase.CodigoMensaje;
                    this.Mensaje = retorno.RespuestaBase.Mensaje;
                }

            }
            else{
              //error también
              this.loggedIn = false;
              this.CodigoMensaje = 1000;
              this.Mensaje = 'Error de llamada Http;';
            }
        });
    }
    //cambiado por la otra api
/*     loginWebDirecto(userInfo){
        var url = environment.API_ENDPOINT + 'Autentificacion?UserName=' + userInfo.UserName + '&Password=' + userInfo.Password + 
        '&UsaEnrolamiento=' + userInfo.UsaEnrolamiento + '&TokenFCM=' + userInfo.TokenFCM;
        let data = this.httpClient.get(url,{});
        return data;
    }
    loginWebNative(userInfo){
        var url = environment.API_ENDPOINT + 'Autentificacion?UserName=' + userInfo.UserName + '&Password=' + userInfo.Password + 
        '&UsaEnrolamiento=' + userInfo.UsaEnrolamiento + '&TokenFCM=' + userInfo.TokenFCM;;
        let data = this.http.get(url, {}, {});
        return data;
    } */
    loginWebDirecto(userInfo){
        var url = environment.API_ENDPOINT + 'AutentificacionApp?UserName=' + userInfo.UserName + '&Password=' + userInfo.Password + 
        '&UsaEnrolamiento=' + userInfo.UsaEnrolamiento + '&TokenFCM=' + userInfo.TokenFCM;
        let data = this.httpClient.get(url,{});
        return data;
    }
    loginWebNative(userInfo){
        var url = environment.API_ENDPOINT + 'AutentificacionApp?UserName=' + userInfo.UserName + '&Password=' + userInfo.Password + 
        '&UsaEnrolamiento=' + userInfo.UsaEnrolamiento + '&TokenFCM=' + userInfo.TokenFCM;;
        let data = this.http.get(url, {}, {});
        return data;
    }

    logout(): void {
        sessionStorage.clear();
        //limpiamos eventos locales
        localStorage.removeItem('NOTIFICACIONES_LOCALES_EVENTOS');

        this.username = '';
        this.loggedIn = false;
    }
    isLoggedId() {
        return this.loggedIn;
    }

    //nuevos metodos para borrar registro
    borrarRegistro(idRegistro){
        let userName = localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') && localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') != '' ? localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') : '';
        let userPass = localStorage.getItem('PASS_USUARIO_LOGUEADO') && localStorage.getItem('PASS_USUARIO_LOGUEADO') != '' ? localStorage.getItem('PASS_USUARIO_LOGUEADO') : '';
        
        let objetoRegistro = {
            IdRegistro : idRegistro.toString(),
            UserName: userName,
            Password: userPass
        };

        const body = JSON.stringify(objetoRegistro);

        let url = environment.API_ENDPOINT + 'AccionesRegistro';
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
    borrarRegistroNative(idRegistro){
        let userName = localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') && localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') != '' ? localStorage.getItem('NOMBRE_USUARIO_LOGUEADO') : '';
        let userPass = localStorage.getItem('PASS_USUARIO_LOGUEADO') && localStorage.getItem('PASS_USUARIO_LOGUEADO') != '' ? localStorage.getItem('PASS_USUARIO_LOGUEADO') : '';

        let objetoRegistro = {
            IdRegistro : idRegistro.toString(),
            UserName: userName,
            Password: userPass
        };
        const body = objetoRegistro;
    
    
        let url = environment.API_ENDPOINT + 'AccionesRegistro';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, body, {});

    }


}