import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, NavController, ToastController, Platform, LoadingController, MenuController, IonList } from '@ionic/angular';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioLaboratorio } from '../../app/services/ServicioLaboratorio';
import { environment } from 'src/environments/environment';
//moment
import * as moment from 'moment';

@Component({
  selector: 'app-modal-examenes',
  templateUrl: './modal-examenes.page.html',
  styleUrls: ['./modal-examenes.page.scss'],
})
export class ModalExamenesPage implements OnInit {
  //color
  miColor = '#FF4081';
  //textColor Directive
  textColor = '#FFFFFF';
  orden: any;
  //tiene registros
  tiene = true;
  public listadoExamenes;
  public oalaId;
  public nombreUsuario;
  public usuarioAps;
  public user;
  public userColor;
  fechaOrden;
  //loading
  estaCargando = false;
  tituloProgress = '';
  linesAvatar = 'none';
  @ViewChild('myList', { read: IonList }) list: IonList;
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
  ) { }

  ngOnInit() {
    moment.locale('es');
    //this.miColor = this.utiles.entregaMiColor();
    this.orden = JSON.parse(this.navParams.get('orden'));
    //console.log(this.orden);
    //this.nombreUsuario = navParams.get('NombreUsuario');
    this.user = JSON.parse(sessionStorage.UsuarioAps);
    this.userColor = this.user.Color;
    this.miColor = this.utiles.entregaColor(this.user);
    if (this.orden) {
      //existe la orden hacer las llamadas
      this.oalaId = this.orden.Id;
      this.fechaOrden = this.orden.Fecha;
      this.loadInicio();
    }
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }
  async loadInicio() {
    //ordenes
    this.listadoExamenes = [];
    //contenido de las llamadas.
    if (sessionStorage.UsuarioAps) {
      //debemos enviar el uspId del titular para que traiga todos los datos
      this.usuarioAps = JSON.parse(sessionStorage.UsuarioAps);
    }
    if (this.usuarioAps) {
      this.estaCargando = true;
      this.tituloProgress = 'Buscando exámenes del usuario';
/*       let loader = await this.loading.create({
        message: 'Obteniendo...<br>Exámenes del usuario',
        duration: 20000
      }); */

      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
      });

      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.lab.getExamenes(this.oalaId).subscribe((response: any) => {
            this.porocesarLista(response, loader);
          }, error => {
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';
            loader.dismiss();

          });
        }
        else {
          //llamada nativa
          this.lab.getExamenesNative(this.oalaId).then((response: any) => {
            this.porocesarLista(JSON.parse(response.data), loader);
          }).catch(error=>{
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';
            loader.dismiss();
          });
        }
      });
    }
  }
  porocesarLista(data, loader) {
    var listado = data;
    if (listado) {
      for (var s in listado) {
        let fecha = moment(listado[s].FechaRegistro).format('DD-MM-YYYY');
        listado[s].Fecha = fecha;
      }
      //ahora asignamos la variable
      this.listadoExamenes = listado;
      if (this.listadoExamenes.length == 0) {
        this.tiene = false;
      }
      //console.log(this.listadoExamenes);
    }
    this.estaCargando = false;
    this.tituloProgress = '';
    loader.dismiss();
  }

}
