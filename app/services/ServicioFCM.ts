import { Injectable, ɵclearResolutionOfComponentResourcesQueue } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
/* import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx'; */
import { ServicioUtiles } from './ServicioUtiles';
import { ServicioNotificaciones } from './ServicioNotificaciones';
import { AngularFireMessaging  } from '@angular/fire/messaging';
import { ServicioParametrosApp } from './ServicioParametrosApp';
//fcm native
import { FirebaseMessaging } from '@ionic-native/firebase-messaging/ngx';

@Injectable()
export class ServicioFCM{
    constructor(
        /* public fcm: FCM,  */
        public utiles: ServicioUtiles, 
        private fm: AngularFireMessaging,
        private firebaseMessaging: FirebaseMessaging,
        private parametros: ServicioParametrosApp,
        private notificaciones: ServicioNotificaciones ){

    }
    //vamos a hacer que el token tenga duración parametrizable
    private verificaTokenSession(){
        var retorno = false;
        var fechaActual = moment();
        var tiempoExpiracion = this.parametros.TIEMPO_EXPIRACION_TOKEN_FCM();

        let token = localStorage.getItem('TOKEN_FIREBASE_MESSAGE') && localStorage.getItem('TOKEN_FIREBASE_MESSAGE') != '' && localStorage.getItem('TOKEN_FIREBASE_MESSAGE') != 'null'
            && localStorage.getItem('TOKEN_FIREBASE_MESSAGE') != 'NULL' ? localStorage.getItem('TOKEN_FIREBASE_MESSAGE') : '';

        if (token != null && localStorage.getItem('DATE_TOKEN_FIREBASE_MESSAGE')){
            //tiene token
            var fechaToken = moment(localStorage.getItem('DATE_TOKEN_FIREBASE_MESSAGE'));
            if (fechaToken.isValid()){
                var difMin = fechaActual.diff(fechaToken, 'minutes');
                if (difMin <= tiempoExpiracion){
                    retorno = true;
                }
            }
        }
        return retorno;
    }
    reintentarObtenerToken(){
        this.firebaseMessaging.getToken().then((token) => {
            console.log('token native ' + token);
            var fecha = moment().format('YYYY-MM-DD HH:mm');
            localStorage.setItem('TOKEN_FIREBASE_MESSAGE', token);
            localStorage.setItem('DATE_TOKEN_FIREBASE_MESSAGE', fecha);
        });  
    }
    initFCM(){
        //ESTA ES UNA VALIDACION ANTERIOR
        if (this.parametros.USA_NOTIFICACION_FCM()){
            if (this.utiles.isAppOnDevice()) {
                //native
                this.firebaseMessaging.requestPermission({ forceShow: true }).then(() => {
                    console.log('push permitido');
                })
                //pasaremos apn-string
                if (this.verificaTokenSession() == false) {
                    this.firebaseMessaging.getToken().then((token) => {
                        console.log('token native ' + token);
                        var fecha = moment().format('YYYY-MM-DD HH:mm');
                        localStorage.setItem('TOKEN_FIREBASE_MESSAGE', token);
                        localStorage.setItem('DATE_TOKEN_FIREBASE_MESSAGE', fecha);
                    }, error => {
                        //reitentamos
                        this.reintentarObtenerToken();
                        console.log(JSON.parse(error));
                    }

                    )
                }
                else {
                    console.log('token native ' + localStorage.getItem('TOKEN_FIREBASE_MESSAGE'));
                }

            }
            else{
                //web
                this.fm.requestPermission.subscribe(()=>{
                    console.log('permisos fiirebase OK')
                }, error=>{ console.error(error)});
    
                if (this.verificaTokenSession() == false) {
                    this.fm.getToken.subscribe((token) => {
                        console.log('token WEB ' + token);
                        var fecha = moment().format('YYYY-MM-DD HH:mm');
                        localStorage.setItem('TOKEN_FIREBASE_MESSAGE', token);
                        localStorage.setItem('DATE_TOKEN_FIREBASE_MESSAGE', fecha);
                    })
                }
                else{
                    console.log('token WEB ' + localStorage.getItem('TOKEN_FIREBASE_MESSAGE'));
                }
    
            }
        }
        else{
            console.log('No configurado para Firebase messaggin.');
        }
    }
    receiveMessage(esNotificacion){
        if (this.verificaTokenSession()){
            if (this.utiles.isAppOnDevice()){
                //nativo
                if (esNotificacion){
                    //primer plano
                    this.firebaseMessaging.onMessage().subscribe((payload:any)=>{
                       console.log('has recibido un mensaje en primer plano');
                       console.log(payload);
                       //ojo aca estta llegando cuando se trata de una notificacion nativa
                       //this.utiles.presentToast('prueba', 'bottom', 5000);
                    });
                    this.firebaseMessaging.onBackgroundMessage().subscribe((payload:any)=>{
                        console.log(payload);
                        console.log('has recibido un mensaje en SEGUNDO plano');
                        //ojo aca estta llegando cuando se trata de una notificacion nativa
                        //this.utiles.presentToast('prueba', 'bottom', 5000);
                    })
                }
            }
            else {
                if (esNotificacion){
                    //aca me recibe cuando esta solo en segundo plano
                    this.fm.messages.subscribe((payload: any) => {
                        console.log(payload);
                        console.log(payload.notification);
                        //aca crear mensaje web con toast
                        this.notificaciones.crearNotificacion(payload.notification.tag, payload.notification.title, payload.notification.body);
                    });
/*                     this.fm.onBackgroundMessage(function(payload:any){
                        this.notificaciones.crearNotificacion(payload.notification.tag, payload.notification.title, payload.notification.body);
                    }) */
                }
            }
        }
    }
}