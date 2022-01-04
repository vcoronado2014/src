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
  selector: 'app-modal-busqueda',
  templateUrl: './modal-busqueda.page.html',
  styleUrls: ['./modal-busqueda.page.scss'],
})
export class ModalBusquedaPage implements OnInit{
    estaCargando = false;
    tituloLoading = '';
    styleAvatar = false;
    examenes = [];
    listaBusqueda = [
        {
            Inidice: 1,
            Nombre: 'Fecha de solicitud',
            TieneFecha: false,
            Valor: false
        },
        {
            Inidice: 2,
            Nombre: 'Fecha de toma de muestra',
            TieneFecha: false,
            Valor: false
        },
        {
            Inidice: 3,
            Nombre: 'Fecha de resultados',
            TieneFecha: false,
            Valor: false
        },
];
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
        if (this.navParams.get('opciones')) {
            this.examenes = JSON.parse(this.navParams.get('opciones'));
            this.procesarItems();
            console.log(this.examenes);
            console.log(this.listaBusqueda);
        }
    }
    procesarItems() {
        let arrConFechaSolicitud = this.examenes.filter(p => p.FechaSolicitud != '01-01-0001');
        let arrConFechaMuestra = this.examenes.filter(p => p.FechaMuestra != '01-01-0001');
        let arrConFechaResultados = this.examenes.filter(p => p.FechaResultado != '01-01-0001');
        if (arrConFechaSolicitud && arrConFechaSolicitud.length > 0) {
            this.listaBusqueda[0].TieneFecha = true;
        }
        if (arrConFechaMuestra && arrConFechaMuestra.length > 0) {
            this.listaBusqueda[1].TieneFecha = true;
        }
        if (arrConFechaResultados && arrConFechaResultados.length > 0) {
            this.listaBusqueda[2].TieneFecha = true;
        }

    }

    dismiss() {
        this.modalCtrl.dismiss();
/*         if (this.haySeleccionado()) {
            this.modalCtrl.dismiss({
                data: this.listaBusqueda
            });
        }
        else{
            this.utiles.presentToast('Debe seleccionar un orden para continuar', 'bottom', 3000);
        } */
    }
    dismissDatos() {
        //this.modalCtrl.dismiss();
        if (this.haySeleccionado()) {
            this.modalCtrl.dismiss({
                data: this.listaBusqueda
            });
        }
        else{
            this.utiles.presentToast('Debe seleccionar un orden para continuar', 'bottom', 3000);
        }
    }
    onChange(event) {
        if (event.detail) {
            if (this.listaBusqueda && this.listaBusqueda.length > 0) {
                for (var s in this.listaBusqueda) {
                    if (this.listaBusqueda[s].Nombre == event.detail.value) {
                        this.listaBusqueda[s].Valor = true;
                    }
                    else {
                        this.listaBusqueda[s].Valor = false;
                    }
                }
            }
            console.log(this.listaBusqueda);
        }
    }
    haySeleccionado(){
        var retorno = false;
        var arrSeleccionados = this.listaBusqueda.filter(p=>p.Valor == true);
        if (arrSeleccionados && arrSeleccionados.length > 0){
            retorno = true;
        }
        return retorno;
    }
}