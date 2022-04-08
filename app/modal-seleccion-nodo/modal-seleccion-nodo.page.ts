import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, NavController, ToastController, Platform, LoadingController, MenuController, AlertController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-modal-seleccion-nodo',
  templateUrl: './modal-seleccion-nodo.page.html',
  styleUrls: ['./modal-seleccion-nodo.page.scss'],
  providers: [NavParams]
})
export class ModalSeleccionNodoPage implements OnInit {

  public usuarioAps;
  idConsultar;
  listadoNodos = [];
  estaCargando = false;
  //ACA HAY 2 COSAS, CUANDO SE BUSCA CITAS PARA EL NODO COSAM DICE QUE EL ESTABLECIMIENTO NO ESTA HABILITADO
  //LA SEGUNDA ES QUE EL BOTON ATRAS DE ESTA SELECCCION DEBE VOLVER A LLEVARLO A LA PANTALLA DE NODOS
  //ADEMAS muestra vacio cuando no hay oferta y se gatilla el toast con error, controlar eso.
  //verificar porque no trae nadA

  constructor(
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public utiles: ServicioUtiles,
    public navCtrl: NavController,
    public toast: ToastController,
    public platform: Platform,
    public menu: MenuController,
    public loading: LoadingController,
    private alertController: AlertController,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.Id) {
        this.listadoNodos = this.utiles.obtenerEstablecimientosRayen(params.Id);
        //this.estaAgregandoFamilia = true;
        this.idConsultar = params.Id;
        this.usuarioAps = this.utiles.entregaUsuario(params.Id);
        if (this.usuarioAps != null) {
          this.usuarioAps.UrlImagen = this.utiles.entregaImagen(this.usuarioAps);
          //this.runPaciente = this.utiles.insertarGuion(this.usuarioAps.Rut);
        }
        else {
          this.utiles.presentToast('No hay usuario, vuelva a seleccionar', 'bottom', 2000);
        }
      }
      else {
        this.utiles.presentToast('No hay usuario, vuelva a seleccionar', 'bottom', 2000);
        this.irAHome();
      }
    });
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }

  irAHome() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        idUsp: this.idConsultar
      }
    };
    this.navCtrl.navigateBack(['calendario'], navigationExtras);
  }
  irAReservar(nodo) {
    //console.log(nodo);
    const navigationExtras: NavigationExtras = {
      queryParams: {
        Id: this.usuarioAps.Id,
        CodigoDeis: nodo.codigoDeis2014 ? nodo.codigoDeis2014 : this.usuarioAps.ConfiguracionNodo.CodigoDeis2014,
        NodId: nodo.id ? nodo.id : this.usuarioAps.NodId
      }
    };
    this.navCtrl.navigateRoot(['pre-tiposatencion'], navigationExtras);
  }

}