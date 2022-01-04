import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController } from '@ionic/angular';

import { ServicioUtiles } from '../../../app/services/ServicioUtiles';
import { ServicioParametrosApp } from '../../../app/services/ServicioParametrosApp';
@Component({
  selector: 'app-content-slide',
  templateUrl: './content-slide.component.html',
  styleUrls: ['./content-slide.component.scss'],
})
export class ContentSlideComponent implements OnInit {
  @Input() modulo;
  @Input() titulo;
  @Input() subTitulo;
  @Input() contenido;
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
/*   openGenerico(modulo){
    var pageName = modulo.toLowerCase();
    this.navCtrl.navigateRoot(pageName);
  }

  openItemPage(modulo){
    this.openGenerico(modulo);
  } */

}