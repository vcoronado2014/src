import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController } from '@ionic/angular';

import { ServicioUtiles } from '../../../app/services/ServicioUtiles';

@Component({
    selector: 'app-pagina-mensajes',
    templateUrl: './pagina-mensajes.component.html',
    styleUrls: ['./pagina-mensajes.component.scss'],
  })

  export class PaginaMensajesComponent implements OnInit {
    @Input() titulo: any;
    @Input() contenido: any;
    @Input() irA: string = 'inicio';
    constructor(
        public navCtrl: NavController,
        public toast: ToastController,
        public modalCtrl: ModalController,
        public platform: Platform,
        public loading: LoadingController,
        public menu:MenuController,
        public utiles: ServicioUtiles,
      ) { }
    
      ngOnInit() {}
      volver(){
          console.log('volver');
          this.navCtrl.navigateRoot(this.irA);
      }
  }
