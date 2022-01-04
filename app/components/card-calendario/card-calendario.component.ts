import { Component, Input, OnInit } from '@angular/core';
import { MomentPipe } from '../../../app/pipes/fecha.pipe';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonItem, AlertController } from '@ionic/angular';
//modal
import { ModalDetalleCitaPage } from '../../modal-detalle-cita/modal-detalle-cita.page';
//moment
import * as moment from 'moment';
import { ServicioUtiles } from '../../../app/services/ServicioUtiles';

@Component({
  selector: 'app-card-calendario',
  templateUrl: './card-calendario.component.html',
  styleUrls: ['./card-calendario.component.scss'],
})
export class CardCalendarioComponent implements OnInit {

  @Input() item = {
    Mostrar: false,
    FechaCompleta: '',
    NumeroDia: '',
    DiferenciaFechas: '',
    Eventos: [],
  };
  @Input() fechaActual;
  @Input() anioActual;


  constructor(
    public navCtrl: NavController,
    public toast: ToastController,     
    public modalCtrl: ModalController,
    public platform: Platform,
    public menu:MenuController,
    private alertController: AlertController,
    public utiles: ServicioUtiles,
  ) { }

  ngOnInit() {
    moment().locale('es');
  }
  transformDate(value, format){
    var pi = new MomentPipe();
    return pi.transform(value, format);
  }
  revisaEstado(item){
    var retorno = false;
    if (item.DetalleEventoMes){
      if (item.DetalleEventoMes.Estado){
        if (item.DetalleEventoMes.Estado != undefined && item.DetalleEventoMes.Estado != ''){
          retorno = true;
        }
      }
    }
    return retorno;
  }



}
