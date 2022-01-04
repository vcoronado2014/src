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
//fcm native
import { FirebaseMessaging } from '@ionic-native/firebase-messaging/ngx';

@Injectable()
export class ServicioFCM{
    constructor(
        /* public fcm: FCM,  */
        public utiles: ServicioUtiles, 
        private fm: AngularFireMessaging,
        private firebaseMessaging: FirebaseMessaging,
        private notificaciones: ServicioNotificaciones ){

    }
    //vamos a hacer que el token dure 3 días
    private verificaTokenSession(){
        var retorno = false;
        var fechaActual = moment();

        if (localStorage.getItem('TOKEN_FIREBASE_MESSAGE') && localStorage.getItem('DATE_TOKEN_FIREBASE_MESSAGE')){
            //tiene token
            var fechaToken = moment(localStorage.getItem('DATE_TOKEN_FIREBASE_MESSAGE'));
            if (fechaToken.isValid()){
                var difDays = fechaActual.diff(fechaToken, 'days');
                if (difDays <= 3){
                    retorno = true;
                }
            }
        }
        return retorno;
    }
    initFCM(){
        if (this.utiles.isAppOnDevice()) {
            //native
            this.firebaseMessaging.requestPermission({forceShow: true}).then(()=>{
                console.log('push permitido');
            })
            //pasaremos apn-string
            if (this.verificaTokenSession() == false) {
                this.firebaseMessaging.getToken().then((token) => {
                    console.log('token native ' + token);
                    var fecha = moment().format('YYYY-MM-DD HH:mm');
                    localStorage.setItem('TOKEN_FIREBASE_MESSAGE', token);
                    localStorage.setItem('DATE_TOKEN_FIREBASE_MESSAGE', fecha);
                })
            }
            else{
                console.log('token native ' + localStorage.getItem('TOKEN_FIREBASE_MESSAGE'));
            }

        }
        else{
            //web
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
    receiveMessage(esNotificacion){
        if (this.verificaTokenSession()){
            if (this.utiles.isAppOnDevice()){
                //nativo
                if (esNotificacion){
                    //primer plano
                    this.firebaseMessaging.onMessage().subscribe((payload:any)=>{
                       console.log(payload);
                    });
                    this.firebaseMessaging.onBackgroundMessage().subscribe((payload:any)=>{
                        console.log(payload);
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