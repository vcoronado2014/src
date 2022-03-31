import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonItem } from '@ionic/angular';
//parametros
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioLaboratorio } from '../../app/services/ServicioLaboratorio';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
//modal
import { ModalExamenesPage } from '../modal-examenes/modal-examenes.page';
//modal
import { ModalBusquedaPage } from '../modal-busqueda/modal-busqueda.page';
//moment
import * as moment from 'moment';

@Component({
  selector: 'app-ordenes',
  templateUrl: './ordenes.page.html',
  styleUrls: ['./ordenes.page.scss'],
})
export class OrdenesPage implements OnInit {
  @ViewChild('myList', { read: IonItem }) list: IonItem;
  miColor = '#FF4081';
  textColor = '#FFFFFF';
  //tiene registros
  tiene = true;
  public listadoOrdenes;
  public usuarioAps;
  estaCargando = false;
  //nueva busqueda
  listadoOrdenesCompleto = [];
  listadoOrdenesCompletoBackup = [];
  listadoExamenesCompleto = [];
  listadoExamenesCompletoBackUp = [];
  listadoExamenes: any;
  tituloProgress: string;
  lineAvatar = 'none';
  mostrarBusqueda = false;
  //actualiza
  actualiza = 'false';

  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public menu: MenuController,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public utiles: ServicioUtiles,
    public loading: LoadingController,
    private lab: ServicioLaboratorio,
    public acceso: ServicioAcceso,
    public parametrosApp: ServicioParametrosApp
  ) { }
//var arrPresiones = this.presiones.sort((a: any, b: any) => { return this.getTime(moment(b.FechaPresion).toDate()) - this.getTime(moment(a.FechaPresion).toDate()) });
  ngOnInit() {
    moment.locale('es');
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.usuario) {
        this.usuarioAps = JSON.parse(params.usuario);
        this.actualiza = params.actualiza;
        //console.log(this.usuarioAps);
      }
    });
    //this.loadInicio();
    if (this.actualiza == 'true'){
      //this.loadInicioCompleto();
      this.loadInicioAllCompleto();
    }
    else{
      this.loadInicioLocal();
    }
  }

  async filterList(event){
    console.log(event.srcElement.value);
    this.listadoExamenesCompleto = this.listadoExamenesCompletoBackUp;
    //this.listadoOrdenesCompleto = this.listadoOrdenesCompletoBackup;
    
    const searchTerm = event.srcElement.value;
    if (!searchTerm){
      return;
    }
    this.listadoExamenesCompleto = this.listadoExamenesCompleto.filter(examen => {
      if (examen.NombreExamen && searchTerm){
        return (examen.NombreExamen.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
      }
    })
  }
  buscar(){
    //this.listadoOrdenesCompleto = this.listadoOrdenesCompletoBackup;
    this.listadoExamenesCompleto = this.listadoExamenesCompletoBackUp;
    if (this.mostrarBusqueda == false){
      this.mostrarBusqueda = true;
    }
    else{
      this.mostrarBusqueda = false;
    }
  }

  async loadInicioLocal(){
    this.estaCargando = true;
    this.tituloProgress = 'Cargando información...';
    //BUSCAMOS LAS ORDENES LOCALES
    this.listadoOrdenesCompleto = sessionStorage.getItem('ORDENES_COMPLETO') ? JSON.parse(sessionStorage.getItem('ORDENES_COMPLETO')): [];
    this.listadoOrdenesCompleto = this.listadoOrdenesCompleto.filter(p=>p.UspId == this.usuarioAps.Id);

    var todosLosExamenes = sessionStorage.getItem('EXAMENES_COMPLETO') ? JSON.parse(sessionStorage.getItem('EXAMENES_COMPLETO')): [];

    if (this.listadoOrdenesCompleto.length == 0) {
      this.tiene = false;
    }
    //puede que traiga un elemento
    if (this.listadoOrdenesCompleto && this.listadoOrdenesCompleto.length == 1){
      if (this.listadoOrdenesCompleto[0].Estado == "No hay Información"){
        this.tiene = false;
      }
    }

    if (this.listadoOrdenesCompleto && this.listadoOrdenesCompleto.length > 0){
      for(var t in this.listadoOrdenesCompleto){
        //este id hay que buscarlo en el listado de examenes
        var oalaId = this.listadoOrdenesCompleto[t].Id;

        var data = todosLosExamenes.filter(e=>e.IdOrden == oalaId);
        console.log(data);

        for (var s in data) {
/*           let fecha = moment(data[s].FechaRegistro).format('DD-MM-YYYY');
          let fechaMuestra = moment(data[s].FechaMuestra).format('DD-MM-YYYY');
          let fechaSolicitud = moment(data[s].FechaSolicitud).format('DD-MM-YYYY');
          let fechaResultado = moment(data[s].FechaResultado).format('DD-MM-YYYY');
          data[s].Fecha = fecha;
          data[s].FechaMuestra = fechaMuestra;
          data[s].FechaSolicitud = fechaSolicitud;
          data[s].FechaResultado = fechaResultado; */
          this.listadoOrdenesCompleto[t].Examenes.push(data[s]);
          this.listadoExamenesCompleto.push(data[s]);
        }
        if (this.listadoExamenesCompleto.length > 0){
          this.tiene = true;
        }
        this.listadoExamenesCompletoBackUp = this.listadoExamenesCompleto;
        this.estaCargando = false;
        this.tituloProgress = '';

      }
    }

  }

  async loadInicioAllCompleto(){
    this.listadoOrdenesCompleto = [];
    this.listadoExamenesCompleto = [];
    if (this.usuarioAps) {
      this.estaCargando = true;
      this.tituloProgress = 'Cargando información...';

        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.lab.getOrdenesApi(this.usuarioAps.Id).subscribe((response: any) => {
            let listado = response;
            if (listado){
              for (var s in listado) {
                let fecha = moment(listado[s].FechaRegistro).format('DD-MM-YYYY');
                listado[s].Fecha = fecha;
                listado[s].UrlImagen = this.usuarioAps.UrlImagen;
                listado[s].Parentezco = this.usuarioAps.Parentezco.Nombre;
                let entidad = {
                  Estado: listado[s].Estado,
                  Fecha: fecha,
                  Id: listado[s].Id,
                  IdEstado: listado[s].IdEstado,
                  UrlImagen: this.usuarioAps.UrlImagen,
                  Parentezco: this.usuarioAps.Parentezco.Nombre,
                  NombreUsuario: listado[s].NombreUsuario,
                  UspId: listado[s].UspId,
                  Examenes: []
                };

                //procesamos los examenes
                if (listado[s].Examenes){
                  listado[s].Examenes.forEach(exa => {
                    let fecha = moment(listado[s].FechaRegistro).format('DD-MM-YYYY');
                    let fechaMuestra = moment(exa.FechaMuestra).format('DD-MM-YYYY');
                    let fechaSolicitud = moment(exa.FechaSolicitud).format('DD-MM-YYYY');
                    let fechaResultado = moment(exa.FechaResultado).format('DD-MM-YYYY');

                    exa.Fecha = fecha;
                    exa.FechaMuestra = fechaMuestra;
                    exa.FechaSolicitud = fechaSolicitud;
                    exa.FechaResultado = fechaResultado;

                    entidad.Examenes.push(exa);
                    this.listadoExamenesCompleto.push(exa);
                  });
                }

                this.listadoOrdenesCompleto.push(entidad);
                this.listadoExamenesCompletoBackUp = this.listadoExamenesCompleto;
              }
              //guardamos
              //guardaremos en la sesion estos resultados para no volver a actualizarlos cuando el usuario vuelva atrás
              sessionStorage.setItem('ORDENES_COMPLETO', JSON.stringify(this.listadoOrdenesCompleto));
              sessionStorage.setItem('EXAMENES_COMPLETO', JSON.stringify(this.listadoExamenesCompleto));
              //**************************************************************************************************** */

              if (this.listadoOrdenesCompleto.length == 0) {
                this.tiene = false;
              }
              //puede que traiga un elemento
              if (this.listadoOrdenesCompleto && this.listadoOrdenesCompleto.length == 1){
                if (this.listadoOrdenesCompleto[0].Estado == "No hay Información"){
                  this.tiene = false;
                }
              }
              this.listadoOrdenesCompletoBackup = this.listadoOrdenesCompleto;
              console.log(this.listadoOrdenesCompletoBackup);

            }
            this.estaCargando = false;
            this.tituloProgress = '';
          },error=>{
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';

          });
        }
        else {
          //llamada native
          this.lab.getOrdenesApiNative(this.usuarioAps.Id).then((response: any) => {
            let listado = JSON.parse(response.data);
            if (listado){
              for (var s in listado) {
                let fecha = moment(listado[s].FechaRegistro).format('DD-MM-YYYY');
                listado[s].Fecha = fecha;
                listado[s].UrlImagen = this.usuarioAps.UrlImagen;
                listado[s].Parentezco = this.usuarioAps.Parentezco.Nombre;
                let entidad = {
                  Estado: listado[s].Estado,
                  Fecha: fecha,
                  Id: listado[s].Id,
                  IdEstado: listado[s].IdEstado,
                  UrlImagen: this.usuarioAps.UrlImagen,
                  Parentezco: this.usuarioAps.Parentezco.Nombre,
                  NombreUsuario: listado[s].NombreUsuario,
                  UspId: listado[s].UspId,
                  Examenes: []
                };

                //procesamos los examenes
                if (listado[s].Examenes){
                  listado[s].Examenes.forEach(exa => {
                    let fecha = moment(listado[s].FechaRegistro).format('DD-MM-YYYY');
                    let fechaMuestra = moment(exa.FechaMuestra).format('DD-MM-YYYY');
                    let fechaSolicitud = moment(exa.FechaSolicitud).format('DD-MM-YYYY');
                    let fechaResultado = moment(exa.FechaResultado).format('DD-MM-YYYY');

                    exa.Fecha = fecha;
                    exa.FechaMuestra = fechaMuestra;
                    exa.FechaSolicitud = fechaSolicitud;
                    exa.FechaResultado = fechaResultado;

                    entidad.Examenes.push(exa);
                    this.listadoExamenesCompleto.push(exa);
                  });
                }

                this.listadoOrdenesCompleto.push(entidad);
                this.listadoExamenesCompletoBackUp = this.listadoExamenesCompleto;
              }
              //guardamos
              //guardaremos en la sesion estos resultados para no volver a actualizarlos cuando el usuario vuelva atrás
              sessionStorage.setItem('ORDENES_COMPLETO', JSON.stringify(this.listadoOrdenesCompleto));
              sessionStorage.setItem('EXAMENES_COMPLETO', JSON.stringify(this.listadoExamenesCompleto));
              //**************************************************************************************************** */

              if (this.listadoOrdenesCompleto.length == 0) {
                this.tiene = false;
              }
              //puede que traiga un elemento
              if (this.listadoOrdenesCompleto && this.listadoOrdenesCompleto.length == 1){
                if (this.listadoOrdenesCompleto[0].Estado == "No hay Información"){
                  this.tiene = false;
                }
              }
              this.listadoOrdenesCompletoBackup = this.listadoOrdenesCompleto;
              console.log(this.listadoOrdenesCompletoBackup);

            }
            this.estaCargando = false;
            this.tituloProgress = '';
          }).catch(error=>{
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';

          });
        }


    }

  }

  async loadInicioCompleto(){
    this.listadoOrdenesCompleto = [];
    if (this.usuarioAps) {
      this.estaCargando = true;
      this.tituloProgress = 'Cargando información...';
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
      });
      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          //this.lab.getOrdenes(this.usuarioAps.Id).subscribe((response: any) => {
          this.lab.getOrdenesApi(this.usuarioAps.Id).subscribe((response: any) => {
            this.porocesarListaCompleto(response, loader);
          },error=>{
            console.log(error.message);
            this.estaCargando = false;
            this.tituloProgress = '';
            loader.dismiss();
          });
        }
        else {
          //llamada nativa
          //this.lab.getOrdenesNative(this.usuarioAps.Id).then((response: any) => {
          this.lab.getOrdenesApiNative(this.usuarioAps.Id).then((response: any) => {
            this.porocesarListaCompleto(JSON.parse(response.data), loader);
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
  async loadInicio() {
    //mi color
    //this.miColor = this.utiles.entregaMiColor();
    //ordenes
    this.listadoOrdenes = [];
    if (this.usuarioAps) {
      this.miColor = this.utiles.entregaColor(this.usuarioAps);
      this.estaCargando = true;
      let loader = await this.loading.create({
        cssClass: 'loading-vacio',
        showBackdrop: false,
        spinner: null,
      });

      await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          //this.lab.getOrdenes(this.usuarioAps.Id).subscribe((response: any) => {
          this.lab.getOrdenesApi(this.usuarioAps.Id).subscribe((response: any) => {
            this.porocesarLista(response, loader);
          });
        }
        else {
          //llamada nativa
          //this.lab.getOrdenesNative(this.usuarioAps.Id).then((response: any) => {
          this.lab.getOrdenesApiNative(this.usuarioAps.Id).then((response: any) => {
            this.porocesarLista(JSON.parse(response.data), loader);
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
        listado[s].UrlImagen = this.usuarioAps.UrlImagen;
        listado[s].Parentezco = this.usuarioAps.Parentezco.Nombre;
      }
      //ahora asignamos la variable
      this.listadoOrdenes = listado;
      if (this.listadoOrdenes.length == 0) {
        this.tiene = false;
      }
      //console.log(this.listadoOrdenes);
    }
    loader.dismiss();
    this.estaCargando = false;
  }
  async porocesarListaCompleto(data, loader) {
    var listado = data;
    if (listado) {
      for (var s in listado) {
        let fecha = moment(listado[s].FechaRegistro).format('DD-MM-YYYY');
        listado[s].Fecha = fecha;
        listado[s].UrlImagen = this.usuarioAps.UrlImagen;
        listado[s].Parentezco = this.usuarioAps.Parentezco.Nombre;
        let entidad = {
          Estado: listado[s].Estado,
          Fecha: fecha,
          Id: listado[s].Id,
          IdEstado: listado[s].IdEstado,
          UrlImagen: this.usuarioAps.UrlImagen,
          Parentezco: this.usuarioAps.Parentezco.Nombre,
          NombreUsuario: listado[s].NombreUsuario,
          UspId: listado[s].UspId,
          Examenes: []
        }
        this.listadoOrdenesCompleto.push(entidad);
      }
      //vamos a filtrar los resultados de acuerdo a la consulta
      this.listadoOrdenesCompleto = this.listadoOrdenesCompleto.filter(p=>p.UspId == this.usuarioAps.Id);
      //guardaremos en la sesion estos resultados para no volver a actualizarlos cuando el usuario vuelva atrás
      sessionStorage.setItem('ORDENES_COMPLETO', JSON.stringify(this.listadoOrdenesCompleto));
      //**************************************************************************************************** */

      if (this.listadoOrdenesCompleto.length == 0) {
        this.tiene = false;
      }
      //puede que traiga un elemento
      if (this.listadoOrdenesCompleto && this.listadoOrdenesCompleto.length == 1){
        if (this.listadoOrdenesCompleto[0].Estado == "No hay Información"){
          this.tiene = false;
        }
      }
      //this.estaCargando = false;
      //loader.dismiss();
      //aca hacer foreach para traer los examenes
      if (this.listadoOrdenesCompleto && this.listadoOrdenesCompleto.length > 0){
        for(var t in this.listadoOrdenesCompleto){

          this.estaCargando = true;
          this.tituloProgress = 'Cargando información...';

            if (!this.utiles.isAppOnDevice()) {
              //llamada web
              //this.lab.getExamenes(this.listadoOrdenesCompleto[t].Id).subscribe((response: any) => {
              this.lab.getExamenesApi(this.listadoOrdenesCompleto[t].Id).subscribe((response: any) => {
                //this.porocesarLista(response, loader);
                var data = response;
                if (data){
                  for (var s in data) {
                    let fecha = moment(data[s].FechaRegistro).format('DD-MM-YYYY');
                    let fechaMuestra = moment(data[s].FechaMuestra).format('DD-MM-YYYY');
                    let fechaSolicitud = moment(data[s].FechaSolicitud).format('DD-MM-YYYY');
                    let fechaResultado = moment(data[s].FechaResultado).format('DD-MM-YYYY');
                    data[s].Fecha = fecha;
                    data[s].FechaMuestra = fechaMuestra;
                    data[s].FechaSolicitud = fechaSolicitud;
                    data[s].FechaResultado = fechaResultado;
                    this.listadoOrdenesCompleto[t].Examenes.push(data[s]);
                    this.listadoExamenesCompleto.push(data[s]);
                  }
                  if (this.listadoExamenesCompleto.length > 0){
                    this.tiene = true;
                  }
                  this.listadoExamenesCompletoBackUp = this.listadoExamenesCompleto;
                  //guardaremos en la sesion estos resultados para no volver a actualizarlos cuando el usuario vuelva atrás
                  sessionStorage.setItem('EXAMENES_COMPLETO', JSON.stringify(this.listadoExamenesCompleto));
                  //**************************************************************************************************** */
                  this.estaCargando = false;
                  loader.dismiss();
                }
                else{
                  this.estaCargando = false;
                  loader.dismiss();
                  
                }
              }, error => {
                console.log(error.message);
                this.estaCargando = false;
                loader.dismiss();
                
    
              });
            }
            else{
              //llamada nativa
              //this.lab.getExamenesNative(this.listadoOrdenesCompleto[t].Id).then((response: any) => {
              this.lab.getExamenesApiNative(this.listadoOrdenesCompleto[t].Id).then((response: any) => {
                var data = JSON.parse(response.data);
                if (data){
                  for (var s in data) {
                    let fecha = moment(data[s].FechaRegistro).format('DD-MM-YYYY');
                    let fechaMuestra = moment(data[s].FechaMuestra).format('DD-MM-YYYY');
                    let fechaSolicitud = moment(data[s].FechaSolicitud).format('DD-MM-YYYY');
                    let fechaResultado = moment(data[s].FechaResultado).format('DD-MM-YYYY');
                    data[s].Fecha = fecha;
                    data[s].FechaMuestra = fechaMuestra;
                    data[s].FechaSolicitud = fechaSolicitud;
                    data[s].FechaResultado = fechaResultado;
                    this.listadoOrdenesCompleto[t].Examenes.push(data[s]);
                    this.listadoExamenesCompleto.push(data[s]);
                  }
                  if (this.listadoExamenesCompleto.length > 0){
                    this.tiene = true;
                  }
                  this.listadoExamenesCompletoBackUp = this.listadoExamenesCompleto;
                  //guardaremos en la sesion estos resultados para no volver a actualizarlos cuando el usuario vuelva atrás
                  sessionStorage.setItem('EXAMENES_COMPLETO', JSON.stringify(this.listadoExamenesCompleto));
                  //**************************************************************************************************** */
                  this.estaCargando = false;
                  loader.dismiss();
                }
                else{
                  this.estaCargando = false;
                  loader.dismiss();
                }

              }).catch(error=>{
                console.log(error.message);
                this.estaCargando = false;
                loader.dismiss();
              });
            }
          

        }
      }
      /////console.log(this.listadoOrdenesCompleto);
      this.listadoOrdenesCompletoBackup = this.listadoOrdenesCompleto;
      console.log(this.listadoOrdenesCompletoBackup);
    }
    else{
      this.estaCargando = false;
      loader.dismiss();
    }
/*     loader.dismiss();
    this.estaCargando = false; */
  }


  async ordenSelected(item) {
    const modal = await this.modalCtrl.create(
      {
        component: ModalExamenesPage,
        componentProps: {
          'orden': JSON.stringify(item)
        }
      }
    );
    return await modal.present();
  }
  async ordenSelectedCompleto(item) {
/*     const modal = await this.modalCtrl.create(
      {
        component: ModalExamenesPage,
        componentProps: {
          'orden': JSON.stringify(item)
        }
      }
    );
    return await modal.present(); */
    console.log(item);
    if (item){
      const navigationExtras: NavigationExtras = {
        queryParams: {
          resultados: JSON.stringify(item.Resultados),
          nombreExamen: item.NombreExamen,
          usuario: JSON.stringify(this.usuarioAps)
        }
      };
      this.navCtrl.navigateRoot(['resultados'], navigationExtras);
    }
  }
  logout() {
    this.acceso.logout();
    this.navCtrl.navigateRoot('login');
  }
  obtenerFiltro(data){
    var filtro = '';
    if (data && data.length > 0){
      for(var s in data){
        if (data[s].Valor == true){
          filtro = data[s].Nombre.toUpperCase();
        }
      }
    }
    return filtro;
  }
  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }
  ordenar(nombreFiltro){
    //arrPeso.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
    if (nombreFiltro.toUpperCase() == 'FECHA DE SOLICITUD'){
      this.listadoExamenesCompleto.sort((a: any, b: any) =>{
        return this.getTime(moment(this.transformDate(b.FechaSolicitud)).toDate()) - this.getTime(moment(this.transformDate(a.FechaSolicitud)).toDate())
      })
    }
    if (nombreFiltro.toUpperCase() == 'FECHA DE TOMA DE MUESTRA'){
      this.listadoExamenesCompleto.sort((a: any, b: any) =>{
        return this.getTime(moment(this.transformDate(b.FechaMuestra)).toDate()) - this.getTime(moment(this.transformDate(a.FechaMuestra)).toDate())
      })
    }
    if (nombreFiltro.toUpperCase() == 'FECHA DE RESULTADOS'){
      this.listadoExamenesCompleto.sort((a: any, b: any) =>{
        return this.getTime(moment(this.transformDate(b.FechaResultado)).toDate()) - this.getTime(moment(this.transformDate(a.FechaResultado)).toDate())
      })
    }
  }
  //para abrir el modal de busqueda
  async modalBusqueda() {
    const modal = await this.modalCtrl.create(
      {
        component: ModalBusquedaPage,
        componentProps: {
          'opciones': JSON.stringify(this.listadoExamenesCompletoBackUp)
        }
      }
    );
    modal.onDidDismiss().then((data) => {
      if (data.data && data.data != undefined) {
        //aca filtrar
        console.log(data);
        var filtro = this.obtenerFiltro(data.data.data);
        this.ordenar(filtro);
      }
    });
    return await modal.present();
  }
  transformDate(dateString) {
    //formato DD-MM-YYYY
    var retorno = "";
    var partes = dateString.split("-");
    if (partes && partes.length == 3) {
      retorno = partes[2] + '-' + partes[1] + '-' + partes[0];
    }
    return retorno;
  }
}
