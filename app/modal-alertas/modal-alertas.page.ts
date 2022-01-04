import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, NavController, ToastController, Platform, LoadingController, MenuController, AlertController } from '@ionic/angular';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioLaboratorio } from '../../app/services/ServicioLaboratorio';
import { ServicioCitas } from '../../app/services/ServicioCitas';
import { environment } from 'src/environments/environment';
//moment
import * as moment from 'moment';
//pipe
import { SplitPipe } from '../../app/pipes/split.pipe';

@Component({
  selector: 'app-modal-alertas',
  templateUrl: './modal-alertas.page.html',
  styleUrls: ['./modal-alertas.page.scss'],
})
export class ModalAlertasPage implements OnInit{
    estaCargando = false;
    tituloLoading = '';
    styleAvatar = false;
    notificaciones = [];
    constructor(
        public modalCtrl: ModalController,
        public navParams: NavParams,
        public utiles: ServicioUtiles,
        public navCtrl: NavController,
        public toast: ToastController,
        public platform: Platform,
        public menu: MenuController,
        public loading: LoadingController,
        private lab: ServicioLaboratorio,
        private alertController: AlertController,
        private agendar: ServicioCitas,
      ) { }


      ngOnInit() {
        moment.locale('es');
        //traer las notificaciones que vienen desde la pagina home
        if (this.navParams.get('notificaciones')){
            this.notificaciones = JSON.parse(this.navParams.get('notificaciones'));
            this.procesarAlertas();
            console.log(this.notificaciones);
        }
      }
      procesarAlertas(){
          if (this.notificaciones && this.notificaciones.length > 0){
              this.notificaciones.forEach(alerta => {
                  let usu = this.utiles.entregaUsuarioNombre(alerta.Subtitulo);
                  alerta.UsuarioAps = usu == null ? null : usu;
                  if (alerta.UsuarioAps != null){
                      alerta.UsuarioAps.UrlImagen = environment.URL_FOTOS + alerta.UsuarioAps.UrlImagen;
                      if (alerta.UsuarioAps.Parentezco){
                        if (alerta.UsuarioAps.Parentezco.Nombre == 'La misma persona'){
                            alerta.UsuarioAps.Parentezco.Nombre = 'Yo';
                        }
                      }
                  }
                  else{
                    //si no está la notificacion viene por ejemplo de asociar un nuevo miembro de la familia
                    alerta.UsuarioAps = {
                      UrlImagen: '',
                      Parentezco: {
                        Nombre: ''
                      }
                    }
                  }
              });
          }
      }
      openNotificacion(modulo) {
        if (modulo && modulo != '') {
          this.dismiss();
          this.navCtrl.navigateRoot(modulo);
        }
      }
      dismiss() {
        this.modalCtrl.dismiss();
      }
}