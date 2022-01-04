import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController } from '@ionic/angular';

import { ServicioUtiles } from '../../../app/services/ServicioUtiles';
import { ServicioParametrosApp } from '../../../app/services/ServicioParametrosApp';
@Component({
  selector: 'app-item-home',
  templateUrl: './item-home.component.html',
  styleUrls: ['./item-home.component.scss'],
})
export class ItemHomeComponent implements OnInit {
  @Input() modulo;
  @Input() classImagen;
  @Input() rutaImagen;
  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public loading: LoadingController,
    public menu:MenuController,
    public utiles: ServicioUtiles,
    public parametrosApp: ServicioParametrosApp,
  ) { }

  ngOnInit() {}
  openGenerico(modulo){
    var tieneInternet = true;
    if (this.utiles.isAppOnDevice()) {
      if (sessionStorage.getItem('CONEXION')) {
        if (sessionStorage.getItem('CONEXION') == 'Offline') {
          tieneInternet = false;
        }
      }
    }
    if (tieneInternet == false){
      this.navCtrl.navigateRoot('error');
    }
    else{
      var pageName = modulo.toLowerCase();
      if (modulo == 'EXAMENES'){
        pageName = 'pre-ordenes';
      }
      //registramos movimiento
      if (sessionStorage.getItem("RSS_ID")) {
        if (this.parametrosApp.USA_LOG_MODULOS()) {
          this.utiles.registrarMovimiento(sessionStorage.getItem("RSS_ID"), modulo.toUpperCase());
        }
      }
      this.navCtrl.navigateRoot(pageName);
    }
  }

  openItemPage(modulo){
    this.openGenerico(modulo);
  }

}
