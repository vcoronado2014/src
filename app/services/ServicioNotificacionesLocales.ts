import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
//notificaciones locales
import { ELocalNotificationTriggerUnit, LocalNotifications } from '@ionic-native/local-notifications/ngx';
//utiles
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
//citas
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';

@Injectable()
export class ServicioNotificacionesLocales{
    
    constructor(
        public platform : Platform,
        public appVersion: AppVersion,
        public toast: ToastController,
        private localNotifications: LocalNotifications,
        private utiles: ServicioUtiles,
        private citas : ServicioCitas,
        public parametrosApp: ServicioParametrosApp
    ){
      //inicializamos los valores
      moment.locale('es');
  
    }
    //busqueda de notificaciones locales
    //definiremos las vacunas covid como notificaciones locales
    getAll(){
        var lista = [];
        let indice = 0;
        //local storage
        if (localStorage.getItem('UsuarioAps')){
            var usuario = JSON.parse(localStorage.getItem('UsuarioAps'));
            if (usuario && usuario.VacunasCovid){
                if (usuario.VacunasCovid.length > 0){
                    usuario.VacunasCovid.forEach(element => {
                        let entidad = {
                            Titulo: element.DescripcionDosis + ' ' + element.DescripcionVacuna,
                            Subtitulo: usuario.Nombres + ' ' + usuario.ApellidoPaterno + ' ' + usuario.ApellidoMaterno,
                            Contenido: 'Tienes aplicada esta dosis el día ' + moment(element.FechaInmunizacion).format('DD-MM-YYYY') + ' en el centro de salud ' + element.DescripcionEstablecimiento,
                            Id: element.Id,
                            Indice: indice
                        }
                        lista.push(entidad);
                        indice++;
                    });
                }

            }
        }
        //local storage
        if (localStorage.getItem('UsuariosFamilia')){
            var usuarios = JSON.parse(localStorage.getItem('UsuariosFamilia'));
            if (usuarios && usuarios.length > 0){
                usuarios.forEach(usuario => {
                    if (usuario && usuario.VacunasCovid.length > 0){
                        usuario.VacunasCovid.forEach(element => {
                            let entidad = {
                                Titulo: element.DescripcionDosis + ' ' + element.DescripcionVacuna,
                                Subtitulo: usuario.Nombres + ' ' + usuario.ApellidoPaterno + ' ' + usuario.ApellidoMaterno,
                                Contenido: 'Tienes aplicada esta dosis el día ' + moment(element.FechaInmunizacion).format('DD-MM-YYYY') + ' en el centro de salud ' + element.DescripcionEstablecimiento,
                                Id: element.Id,
                                Indice: indice
                            }
                            lista.push(entidad);
                            indice++;
                        });
                    }
                })
            }
        }
        //estas son nottificaciones que se obtuvieron de los eventos
         if (localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS')){
            var listaEventos = JSON.parse(localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS'));
            if (listaEventos != null && listaEventos.length > 0){
                listaEventos.forEach(evento => {
                    evento.Indice = indice;
                    lista.push(evento);
                    indice++;
                });
            }
        } 
        return lista;
    }
    removeCita(idCita){
        if (localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS')){
            var listaEventos = JSON.parse(localStorage.getItem('NOTIFICACIONES_LOCALES_EVENTOS'));
            if (listaEventos != null && listaEventos.length > 0){
                let listaSinElemento = listaEventos.filter(p=>p.Id != idCita);
                //esta es la nueva lista
                if (listaSinElemento && listaSinElemento.length > 0){
                    localStorage.setItem('NOTIFICACIONES_LOCALES_EVENTOS', JSON.stringify(listaSinElemento));
                }
            }
        }
    }
}