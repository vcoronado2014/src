import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonSlides } from '@ionic/angular';
//parametros
import { ActivatedRoute, Router } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioInfoUsuario } from '../../app/services/ServicioInfoUsuario';
import { ServicioAcceso } from '../../app/services/ServicioAcceso';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import * as moment from 'moment';


@Component({
  selector: 'app-detail-usuario',
  templateUrl: './detail-usuario.page.html',
  styleUrls: ['./detail-usuario.page.scss'],
})
export class DetailUsuarioPage implements OnInit {
  @ViewChild('mySlider', { static: true }) slides: IonSlides;
  //nuevo slide
  slideOpts = {
    initialSlide: 0,
    speed: 500,
    pager: true
  };
  miColor = '#FF4081';
  //OTROS DATOS
  public usuario;
  public indicadorValor = [];
  public presiones = [];
  public alergias = [];
  //variables del Formulario
  public valorAltura;
  public fechaAltura;
  public valorPeso;
  public fechaPeso;
  public valorImc;
  public fechaImc;
  public valorPresion;
  public fechaPresion;
  public valorGlicemia;
  public fechaGlicemia;
  public valorGrupoSangre;
  public fechaGrupoSangre;
  public usuarioAps;
  public cargando = false;
  public userImagen;
  public title;
  //para controlar componente progess
  estaCargando = false;
  //antecedentes
  antecedentes;
  familiares = [];
  personales = [];
  //card mediciones
  arrMediciones=[];
  tituloProgress = '';
  //2 partes para los datos del usuario
  arrMedicionesParteUno = [];
  arrMedicionesParteDos = [];
  //pruebas de loading independientes
  estaCargandoDatosUsuario = false;
  tituloProgressDatosUsuario = '';
  estaCargandoAlergias = false;
  tituloProgressAlergias = '';
  estaCargandoMorbidos = false;
  tituloProgressMorbidos = '';
  //para mostrar que no tiene
  tieneDatosUsuario = false;
  tieneAlergias = false;
  tieneMorbidosPersonales = false;
  tieneMorbidosFamiliares = false;
  //variables para insertar en local storage
  arrMedicionesL=[];
  arrAlergias=[];
  arrMorbidos=[];
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
    public info: ServicioInfoUsuario,
    public acceso: ServicioAcceso,
    public parametrosApp: ServicioParametrosApp
  ) {

  }
  ngOnInit() {
    //this.miColor = this.utiles.entregaMiColor();
    //capturamos los parametros
    this.slideOpts = {
      initialSlide: 0,
      speed: 500,
      pager: true
    };
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params && params.usuario) {
        //store the temp in data

        this.usuario = JSON.parse(params.usuario);
        if (this.usuario.Parentezco && this.usuario.Parentezco.Id > 0) {
          if (this.usuario.Parentezco.Nombre.toUpperCase() == 'LA MISMA PERSONA') {
            this.usuario.Parentezco.Nombre = 'Yo';
          }
        }
        else {
          this.usuario.Parentezco.Nombre = 'No informado';
        }
        this.userImagen = this.usuario.UrlImagen;
        this.miColor = this.utiles.entregaColor(this.usuario);
        //obtiene los datos del usuario incluyendo la presión
        //este desencadena las 3 llamadas
        //await this.construirArregloValores(this.usuario.Id);

        await this.construirArregloValoresIndividual(this.usuario.Id);
        await this.construirArregloAlergiasIndividual(this.usuario.Id);
        await this.construirArregloMorbidosIndividual(this.usuario.Id);
 
      }
    });
  }
  procesarAntecedentes(data, loader) {
    this.antecedentes = data;
    console.log(this.antecedentes);
    this.familiares = [];
    this.personales = [];
    if (this.antecedentes.Antecedentes){
      if (this.antecedentes.Antecedentes.Familiares){
        if (this.antecedentes.Antecedentes.Familiares.Antecedente && this.antecedentes.Antecedentes.Familiares.Antecedente.length > 0){
          let arr = this.antecedentes.Antecedentes.Familiares.Antecedente;
          arr.forEach(ante => {
            let entidad = {
              Nombre: ante
            }
            this.familiares.push(entidad);
          });
        }
      }
      if (this.antecedentes.Antecedentes.Personales){
        if (this.antecedentes.Antecedentes.Personales.Antecedente && this.antecedentes.Antecedentes.Personales.Antecedente.length > 0){
          let arr = this.antecedentes.Antecedentes.Personales.Antecedente;
          arr.forEach(perso => {
            let entidad = {
              Nombre: perso
            }
            this.personales.push(entidad);
          });
        }
      }
    }

    this.estaCargando = false;
    this.tituloProgress = '';
    loader.dismiss();
  }
  async procesarAlergias(data, loader) {
    this.alergias = data.AlergiasUsp;
    if (this.alergias) {
      if (this.alergias.length == 1) {
        this.title = "Alergia";
      } else {
        this.title = "Alergias";
      }
    }
    this.estaCargando = false;
    this.tituloProgress = '';
    loader.dismiss();
    //esta bien, seguimos con los morbidos
    await this.construirArregloMorbidos(this.usuario.Id);
  }
  procesarAlergiasSinLoader(data) {
    this.alergias = data.AlergiasUsp;
    if (this.alergias.length == 1) {
      this.title = "Alergia";
    } else {
      this.title = "Alergias";
    }
  }
  procesarPresionApi(data, loader) {
    this.presiones = data.PresionesUsp;
    if (this.presiones && this.presiones.length > 0) {
      var arrPresiones = this.presiones.sort((a: any, b: any) => { return this.getTime(moment(b.FechaPresion).toDate()) - this.getTime(moment(a.FechaPresion).toDate()) });
      if (arrPresiones && arrPresiones.length > 0){
        console.log('tiene presion');
        console.log(arrPresiones);
        //el primer elemento es el más nuevo
        this.valorPresion = arrPresiones[0].ValorPresion;
        this.fechaPresion = moment(arrPresiones[0].FechaPresion).format('DD-MM-YYYY HH:mm');
      }
      else{
        console.log('no tiene presion');
        this.valorPresion = 'N/A';
        this.fechaPresion = 'N/A';
      }
    }
    else {
      //llenar con valores predeterminados
      this.valorPresion = 'N/A';
      this.fechaPresion = 'N/A';
    }
    loader.dismiss();
    this.estaCargando = false;
  }
  procesarPresion(data, loader) {
    this.presiones = data.PresionesUsp;
    if (this.presiones && this.presiones.length > 0) {
      //todo ok
      for (var s in this.presiones) {
        //altura
        this.valorPresion = this.presiones[s].ValorPresion;
        if (this.presiones[s].FechaPresion == null) {
          this.fechaPresion = 'n/a';
        }
        else {
          this.fechaPresion = this.presiones[s].FechaPresion;
        }
      }

    }
    else {
      //llenar con valores predeterminados
      this.valorPresion = 'N/A';
      this.fechaPresion = 'N/A';
    }
    loader.dismiss();
    this.estaCargando = false;
  }
  procesarPresionSinLoader(data) {
    this.presiones = data.PresionesUsp;
    if (this.presiones && this.presiones.length > 0) {
      //todo ok
      for (var s in this.presiones) {
        //altura
        this.valorPresion = this.presiones[s].ValorPresion;
        if (this.presiones[s].FechaPresion == null) {
          this.fechaPresion = 'n/a';
        }
        else {
          this.fechaPresion = this.presiones[s].FechaPresion;
        }
      }

    }
    else {
      //llenar con valores predeterminados
      this.valorPresion = 'N/A';
      this.fechaPresion = 'N/A';
    }
  }
  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }
  async procesarNuevoArregloValores(response, loader) {
    this.arrMediciones = [];
    this.arrMedicionesParteUno = [];
    this.arrMedicionesParteDos = [];
    var arreglo = [];
    if (response) {
      arreglo = response.IndicadorValorUsp;
    }
    ///altura
    var arrAltura = arreglo.filter(p => p.Descripcion.includes('Altura') || p.Descripcion.includes('Talla'));
    if (arrAltura && arrAltura.length > 0) {
      console.log('tiene altura');
      //fecha mas actualizada
      arrAltura.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrAltura);
      let entidad = {
        Nombre: 'Altura',
        Valor: arrAltura[0].Valor.toFixed(0),
        Fecha: moment(arrAltura[0].Fecha).format('DD MMM YYYY'),
        Medida: 'cm'
      }
      this.arrMediciones.push(entidad);
    }
    //peso
    var arrPeso = arreglo.filter(p => p.Descripcion.includes('Peso'));
    if (arrPeso && arrPeso.length > 0) {
      console.log('tiene peso');
      //fecha mas actualizada
      arrPeso.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrPeso);
      let entidad = {
        Nombre: 'Peso',
        Valor: arrPeso[0].Valor.toFixed(0),
        Fecha: moment(arrPeso[0].Fecha).format('DD MMM YYYY'),
        Medida: 'kg'
      }
      this.arrMediciones.push(entidad);
    }
    //imc
    var arrImc = arreglo.filter(p => p.Descripcion.includes('I.M.C.'));
    if (arrImc && arrImc.length > 0) {
      console.log('tiene imc');
      //fecha mas actualizada
      arrImc.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrImc);
      let entidad = {
        Nombre: 'IMC',
        Valor: arrImc[0].Valor.toFixed(0),
        Fecha: moment(arrImc[0].Fecha).format('DD MMM YYYY'),
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //glicemia
    var arrGlicemia = arreglo.filter(p => p.Descripcion.includes('Glicemia'));
    if (arrGlicemia && arrGlicemia.length > 0) {
      console.log('tiene glicemia');
      //fecha mas actualizada
      arrGlicemia.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrGlicemia);
      //el primer elemento es el más nuevo
      let entidad = {
        Nombre: 'Glicemia',
        Valor: arrGlicemia[0].Valor.toFixed(0),
        Fecha: moment(arrGlicemia[0].Fecha).format('DD MMM YYYY'),
        Medida: 'mg/dl'
      }
      this.arrMediciones.push(entidad);
    }
    //sangre
    var arrSangre = arreglo.filter(p => p.Descripcion.includes('Sanguineo'));
    if (arrSangre && arrSangre.length > 0) {
      let valor = '';
      console.log('tiene sangre');
      //fecha mas actualizada
      arrSangre.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrSangre);
      //el primer elemento es el más nuevo
      if (arrSangre[0].Valor == 279) {
        valor = "A";
      }
      else if (arrSangre[0].Valor == 280) {
        valor = "B";
      }
      else if (arrSangre[0].Valor == 281) {
        valor = "AB";
      }
      else if (arrSangre[0].Valor == 252) {
        valor = "O";
      }
      else {
        valor = "";
      }
      let entidad = {
        Nombre: 'Grupo Sangre',
        Valor: valor,
        Fecha: moment(arrSangre[0].Fecha).format('DD MMM YYYY'),
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //presion diastolica
    var valorDiast = '';
    var tienePresion = false;
    var fechaPresion = '';
    var arrDiast = arreglo.filter(p => p.Descripcion.includes('Diastólica'));
    if (arrDiast && arrDiast.length > 0) {
      console.log('tiene diastolica');
      //fecha mas actualizada
      arrDiast.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrDiast);
      valorDiast = arrDiast[0].Valor;
      tienePresion = true;
    }
    var valorSist = '';
    var tienePresionSis = false;
    var arrSist = arreglo.filter(p => p.Descripcion.includes('Sistólica'));
    if (arrSist && arrSist.length > 0) {
      console.log('tiene sistolica');
      //fecha mas actualizada
      arrSist.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrSist);
      valorSist = arrSist[0].Valor;
      fechaPresion = moment(arrSist[0].Fecha).format('DD MMM YYYY');
      tienePresionSis = true;
    }
    if (tienePresion && tienePresionSis) {
      let entidad = {
        Nombre: 'Presión',
        Valor: valorSist.toString() + '/' + valorDiast.toString(),
        Fecha: fechaPresion,
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    console.log(this.arrMediciones);
    //aca partimos el arreglo
    this.arrMedicionesParteUno = this.arrMediciones.slice(0, 3);
    this.arrMedicionesParteDos = this.arrMediciones.slice(3, 6);
    //console.log(this.arrMedicionesParteUno);
    //console.log(this.arrMedicionesParteDos);
    this.estaCargando = false;
    this.tituloProgress = '';    
    loader.dismiss();
    //todo ok seguimos con las alergias
    await this.construirArregloAlergias(this.usuario.Id);
  }
  async construirArregloValores(uspId){
    this.arrMediciones = [];
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargando = true;
    this.tituloProgress = 'Buscando datos del paciente';
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.info.getIndicadorValorApi(uspId).subscribe((response: any) => {
          console.log(response);
          //correcto
          this.procesarNuevoArregloValores(response, loader);
        },async error=>{
          console.log(error.message);
          this.estaCargando = false;
          this.tituloProgress = '';
          loader.dismiss();
          //si hubo error cargamos el siguiente
          await this.construirArregloAlergias(this.usuario.Id);
        });
      }
      else{
        //llamada nativa
        this.info.getIndicadorValorNativeApi(uspId).then((response: any) => {
          //this.procesarIndicadorValor(JSON.parse(response.data), loader);
          console.log(JSON.parse(response.data));
          this.procesarNuevoArregloValores(JSON.parse(response.data), loader);
        }).catch(async error =>{
          console.log(error.message);
          this.estaCargando = false;
          this.tituloProgress = '';
          loader.dismiss();
          //si hubo error cargamos el siguiente
          await this.construirArregloAlergias(this.usuario.Id);
        });

      }

    });
  }
  async construirArregloAlergias(uspId){
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargando = true;
    this.tituloProgress = 'Buscando alergias del paciente';
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.info.getAlergiasApi(uspId).subscribe((response: any) => {
          console.log(response);
          //correcto
          this.procesarAlergias(response, loader);
        },async error=>{
          console.log(error.message);
          this.tituloProgress = '';
          this.estaCargando = false;          
          loader.dismiss();
          //si hubo error continuamos con morbidos
          await this.construirArregloMorbidos(this.usuario.Id);
        });
      }
      else{
        //llamada nativa
        this.info.getAlergiasNativeApi(uspId).then((response: any) => {
          //this.procesarIndicadorValor(JSON.parse(response.data), loader);
          console.log(JSON.parse(response.data));
          this.procesarAlergias(JSON.parse(response.data), loader);
        }).catch(async error =>{
          console.log(error.message);
          this.tituloProgress = '';
          this.estaCargando = false;          
          loader.dismiss();
          //si hubo error continuamos con morbidos
          await this.construirArregloMorbidos(this.usuario.Id);
        });

      }

    });
  }
  async construirArregloMorbidos(uspId){
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargando = true;
    this.tituloProgress = 'Buscando otros datos del paciente';
    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.info.postAntecedentesApi(uspId).subscribe((response: any) => {
          console.log(response);
          //correcto
          this.procesarAntecedentes(response, loader);
        },error=>{
          console.log(error.message);
          this.estaCargando = false;
          this.tituloProgress = '';
          loader.dismiss();
        });
      }
      else{
        //llamada nativa
        this.info.postAntecedentesNativeApi(uspId).then((response: any) => {
          //this.procesarIndicadorValor(JSON.parse(response.data), loader);
          console.log(JSON.parse(response.data));
          this.procesarAntecedentes(JSON.parse(response.data), loader);
        }).catch(error =>{
          console.log(error.message);
          this.estaCargando = false;
          this.tituloProgress = '';
          loader.dismiss();
        });

      }

    });
  }
  porcesarIndicadorValorApi(data, loader){
    //Glicemia mg/dl
    //Grupo Sanguineo  279: A
    //280: B
    //281: AB
    //252: 0
    this.indicadorValor =[];
    if (data){
      this.indicadorValor =  data.IndicadorValorUsp;
    }
    
    if (this.indicadorValor && this.indicadorValor.length > 0){
      //ahora procesamos los valores
      //altura
      var arrAltura = this.indicadorValor.filter(p=>p.Descripcion.includes('Altura') || p.Descripcion.includes('Talla'));
      if (arrAltura && arrAltura.length > 0){
        console.log('tiene altura');
        //fecha mas actualizada
        arrAltura.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
        console.log(arrAltura);
        //el primer elemento es el más nuevo
        this.valorAltura = arrAltura[0].Valor;
        this.fechaAltura = moment(arrAltura[0].Fecha).format('DD-MM-YYYY HH:mm');
      }
      else{
        console.log('no tiene altura');
        this.valorAltura = 'No informada';
        this.fechaAltura = 'No informada';
      }
      //fin altura
      //peso
      var arrPeso = this.indicadorValor.filter(p=>p.Descripcion.includes('Peso'));
      if (arrPeso && arrPeso.length > 0){
        console.log('tiene peso');
        //fecha mas actualizada
        arrPeso.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
        console.log(arrPeso);
        //el primer elemento es el más nuevo
        this.valorPeso = arrPeso[0].Valor.toFixed(2);
        this.fechaPeso = moment(arrPeso[0].Fecha).format('DD-MM-YYYY HH:mm');
      }
      else{
        console.log('no tiene peso');
        this.valorPeso = 'No informado';
        this.fechaPeso = 'No informada';
      }
      //fin peso
      var arrImc = this.indicadorValor.filter(p=>p.Descripcion.includes('I.M.C.'));
      if (arrImc && arrImc.length > 0){
        console.log('tiene imc');
        //fecha mas actualizada
        arrImc.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
        console.log(arrImc);
        //el primer elemento es el más nuevo
        this.valorImc = arrImc[0].Valor.toFixed(2);
        this.fechaImc = moment(arrImc[0].Fecha).format('DD-MM-YYYY HH:mm');
      }
      else{
        console.log('no tiene imc');
        this.valorImc = 'No informado';
        this.fechaImc = 'No informada';
      }
      //fin imc
      var arrGlicemia = this.indicadorValor.filter(p=>p.Descripcion.includes('Glicemia'));
      if (arrGlicemia && arrGlicemia.length > 0){
        console.log('tiene glicemia');
        //fecha mas actualizada
        arrGlicemia.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
        console.log(arrGlicemia);
        //el primer elemento es el más nuevo
        this.valorGlicemia = arrGlicemia[0].Valor;
        this.fechaGlicemia = moment(arrGlicemia[0].Fecha).format('DD-MM-YYYY HH:mm');
      }
      else{
        console.log('no tiene glicemia');
        this.valorGlicemia = 'No informada';
        this.fechaGlicemia = 'No informada';
      }
      //fin glicemia
      var arrSangre = this.indicadorValor.filter(p=>p.Descripcion.includes('Sanguineo'));
      if (arrSangre && arrSangre.length > 0){
        console.log('tiene sangre');
        //fecha mas actualizada
        arrSangre.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
        console.log(arrSangre);
        //el primer elemento es el más nuevo
        if (arrSangre[0].Valor == 279){
          this.valorGrupoSangre = "A";
        }
        else if (arrSangre[0].Valor == 280){
          this.valorGrupoSangre = "B";
        }
        else if (arrSangre[0].Valor == 281){
          this.valorGrupoSangre = "AB";
        }
        else if (arrSangre[0].Valor == 252){
          this.valorGrupoSangre = "O";
        }
        else{
          this.valorGrupoSangre = "";
        }
        
        this.fechaGrupoSangre = moment(arrSangre[0].Fecha).format('DD-MM-YYYY HH:mm');
      }
      else{
        console.log('no tiene sangre');
        this.valorGrupoSangre = 'No informada';
        this.fechaGrupoSangre = 'No informada';
      }
      loader.dismiss();
      //para progress
      this.estaCargando = false;
    }
    else {
      //viene valor nulo
      //llenar con valores predeterminados
      this.valorAltura = 'No informada';
      this.fechaAltura = 'No informada';
      this.valorPeso = 'No informado';
      this.fechaPeso = 'No informada';
      this.valorImc = 'No informado';
      this.fechaImc = 'No informada';
      this.valorGlicemia = 'No informada';
      this.fechaGlicemia = 'No informada';
      this.valorGrupoSangre = 'No informada';
      this.fechaGrupoSangre = 'No informada';
    }
    loader.dismiss();
    //para progress
    this.estaCargando = false;
  }
  procesarIndicadorValor(data, loader) {
    this.indicadorValor = data.IndicadorValorUsp;
    if (this.indicadorValor) {
      if (this.indicadorValor.length > 0) {
        //todo ok
        for (var s in this.indicadorValor) {
          //altura
          if (this.indicadorValor[s].Descripcion.includes('Altura') || this.indicadorValor[s].Descripcion.includes('Talla')) {
            this.valorAltura = this.indicadorValor[s].Valor.toString();
            if (this.indicadorValor[s].Fecha == null) {
              this.fechaAltura = 'n/a';
            }
            else {
              this.fechaAltura = '3 días';
            }
          }
          //peso
          if (this.indicadorValor[s].Descripcion.includes('Peso')) {
            this.valorPeso = this.indicadorValor[s].Valor.toString();
            if (this.indicadorValor[s].Fecha == null) {
              this.fechaPeso = 'n/a';
            }
            else {
              this.fechaPeso = '3 días';
            }
          }
          //IMC
          if (this.indicadorValor[s].Descripcion == 'I.M.C.') {
            this.valorImc = this.indicadorValor[s].Valor.toString();
            if (this.indicadorValor[s].Fecha == null) {
              this.fechaImc = 'n/a';
            }
            else {
              this.fechaImc = '3 días';
            }
          }
        }

      }
      else {
        //llenar con valores predeterminados
        this.valorAltura = 'No informada';
        this.fechaAltura = 'No informada';
        this.valorPeso = 'No informado';
        this.fechaPeso = 'No informada';
        this.valorImc = 'No informado';
        this.fechaImc = 'No informada';
      }
    }
    else {
      //viene valor nulo
      //llenar con valores predeterminados
      this.valorAltura = 'No informada';
      this.fechaAltura = 'No informada';
      this.valorPeso = 'No informado';
      this.fechaPeso = 'No informada';
      this.valorImc = 'No informado';
      this.fechaImc = 'No informada';
    }
    loader.dismiss();
    //para progress
    this.estaCargando = false;
  }
  /*   doRefresh(event) {
      console.log('Begin async operation');
  
      setTimeout(() => {
        console.log('Async operation has ended');
        this.loadData(this.usuario.Id);
        event.target.complete();
      }, 2000);
    } */
  logout() {
    this.acceso.logout();
    this.navCtrl.navigateRoot('login');
  }

  //pruebas de carga individual
  async construirArregloValoresIndividual(uspId){
    this.arrMediciones = [];
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargandoDatosUsuario = true;
    this.tituloProgressDatosUsuario = 'Buscando datos del paciente';
    await loader.present().then(async () => {
      //validamos si necesita actualizar
      if (this.utiles.necesitaActualizarDatosPaciente(uspId) == false){
        var datos = this.utiles.entregaArregloDatosPaciente(uspId);
        this.procesarNuevoArregloValoresIndependiente(datos, loader, this.usuario, false);
      }
      else {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.info.getIndicadorValorApi(uspId).subscribe((response: any) => {
            console.log(response);
            //correcto
            this.procesarNuevoArregloValoresIndependiente(response, loader, this.usuario, true);
          }, async error => {
            console.log(error.message);
            this.estaCargandoDatosUsuario = false;
            this.tituloProgressDatosUsuario = '';
            loader.dismiss();
          });
        }
        else {
          //llamada nativa
          this.info.getIndicadorValorNativeApi(uspId).then((response: any) => {
            //this.procesarIndicadorValor(JSON.parse(response.data), loader);
            console.log(JSON.parse(response.data));
            this.procesarNuevoArregloValoresIndependiente(JSON.parse(response.data), loader, this.usuario, true);
          }).catch(async error => {
            console.log(error.message);
            this.estaCargandoDatosUsuario = false;
            this.tituloProgressDatosUsuario = '';
            loader.dismiss();
          });

        }
      }


    });
  }
  async procesarNuevoArregloValoresIndependiente(response, loader, usuarioAps, guardaLocalStorage) {
    //procesamos los datos en el local storage
    if (guardaLocalStorage) {
      var entidad = {
        UsuarioAps: usuarioAps,
        Mediciones: null,
      }
      entidad.Mediciones = response;
      this.arrMedicionesL = [];
      if (localStorage.getItem('ANTECEDENTES')){
        this.arrMedicionesL = JSON.parse(localStorage.getItem('ANTECEDENTES'));
      }
      this.arrMedicionesL.push(entidad);
      localStorage.setItem('ANTECEDENTES', JSON.stringify(this.arrMedicionesL));
      localStorage.setItem('FECHA_ACTUALIZACION_ANTECEDENTES', moment().format('YYYY-MM-DD HH:mm'));
    }
    //fin proceso ********************************
    this.arrMediciones = [];
    this.arrMedicionesParteUno = [];
    this.arrMedicionesParteDos = [];
    var arreglo = [];
    if (response) {
      arreglo = response.IndicadorValorUsp;
    }
    ///altura
    var arrAltura = arreglo.filter(p => p.Descripcion.includes('Altura') || p.Descripcion.includes('Talla'));
    if (arrAltura && arrAltura.length > 0) {
      console.log('tiene altura');
      //fecha mas actualizada
      arrAltura.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrAltura);
      let entidad = {
        Nombre: 'Altura',
        Valor: arrAltura[0].Valor.toFixed(0),
        Fecha: moment(arrAltura[0].Fecha).format('DD MMM YYYY'),
        Medida: 'cm'
      }
      this.arrMediciones.push(entidad);
    }
    //peso
    var arrPeso = arreglo.filter(p => p.Descripcion.includes('Peso'));
    if (arrPeso && arrPeso.length > 0) {
      console.log('tiene peso');
      //fecha mas actualizada
      arrPeso.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrPeso);
      let entidad = {
        Nombre: 'Peso',
        Valor: arrPeso[0].Valor.toFixed(0),
        Fecha: moment(arrPeso[0].Fecha).format('DD MMM YYYY'),
        Medida: 'kg'
      }
      this.arrMediciones.push(entidad);
    }
    //imc
    var arrImc = arreglo.filter(p => p.Descripcion.includes('I.M.C.'));
    if (arrImc && arrImc.length > 0) {
      console.log('tiene imc');
      //fecha mas actualizada
      arrImc.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrImc);
      let entidad = {
        Nombre: 'IMC',
        Valor: arrImc[0].Valor.toFixed(0),
        Fecha: moment(arrImc[0].Fecha).format('DD MMM YYYY'),
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //glicemia
    var arrGlicemia = arreglo.filter(p => p.Descripcion.includes('Glicemia'));
    if (arrGlicemia && arrGlicemia.length > 0) {
      console.log('tiene glicemia');
      //fecha mas actualizada
      arrGlicemia.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrGlicemia);
      //el primer elemento es el más nuevo
      let entidad = {
        Nombre: 'Glicemia',
        Valor: arrGlicemia[0].Valor.toFixed(0),
        Fecha: moment(arrGlicemia[0].Fecha).format('DD MMM YYYY'),
        Medida: 'mg/dl'
      }
      this.arrMediciones.push(entidad);
    }
    //sangre
    var arrSangre = arreglo.filter(p => p.Descripcion.includes('Sanguineo'));
    if (arrSangre && arrSangre.length > 0) {
      let valor = '';
      console.log('tiene sangre');
      //fecha mas actualizada
      arrSangre.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrSangre);
      //el primer elemento es el más nuevo
      if (arrSangre[0].Valor == 279) {
        valor = "A";
      }
      else if (arrSangre[0].Valor == 280) {
        valor = "B";
      }
      else if (arrSangre[0].Valor == 281) {
        valor = "AB";
      }
      else if (arrSangre[0].Valor == 252) {
        valor = "O";
      }
      else {
        valor = "";
      }
      let entidad = {
        Nombre: 'Grupo Sangre',
        Valor: valor,
        Fecha: moment(arrSangre[0].Fecha).format('DD MMM YYYY'),
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    //presion diastolica
    var valorDiast = '';
    var tienePresion = false;
    var fechaPresion = '';
    var arrDiast = arreglo.filter(p => p.Descripcion.includes('Diastólica'));
    if (arrDiast && arrDiast.length > 0) {
      console.log('tiene diastolica');
      //fecha mas actualizada
      arrDiast.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrDiast);
      valorDiast = arrDiast[0].Valor;
      tienePresion = true;
    }
    var valorSist = '';
    var tienePresionSis = false;
    var arrSist = arreglo.filter(p => p.Descripcion.includes('Sistólica'));
    if (arrSist && arrSist.length > 0) {
      console.log('tiene sistolica');
      //fecha mas actualizada
      arrSist.sort((a: any, b: any) => { return this.getTime(moment(b.Fecha).toDate()) - this.getTime(moment(a.Fecha).toDate()) });
      console.log(arrSist);
      valorSist = arrSist[0].Valor;
      fechaPresion = moment(arrSist[0].Fecha).format('DD MMM YYYY');
      tienePresionSis = true;
    }
    if (tienePresion && tienePresionSis) {
      let entidad = {
        Nombre: 'Presión',
        Valor: valorSist.toString() + '/' + valorDiast.toString(),
        Fecha: fechaPresion,
        Medida: ''
      }
      this.arrMediciones.push(entidad);
    }
    console.log(this.arrMediciones);
    //aca partimos el arreglo
    this.arrMedicionesParteUno = this.arrMediciones.slice(0, 3);
    this.arrMedicionesParteDos = this.arrMediciones.slice(3, 6);
    //console.log(this.arrMedicionesParteUno);
    //console.log(this.arrMedicionesParteDos);
    this.estaCargandoDatosUsuario = false;
    this.tituloProgressDatosUsuario = '';
    if (this.arrMediciones && this.arrMediciones.length > 0){
      this.tieneDatosUsuario = true;
    }    
    loader.dismiss();
  }
  async construirArregloAlergiasIndividual(uspId){
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargandoAlergias = true;
    this.tituloProgressAlergias = 'Buscando alergias del paciente';
    await loader.present().then(async () => {
      if (this.utiles.necesitaActualizarAlergiasPacientes(uspId) == false){
        var datos = this.utiles.entregaArregloAlergiasPaciente(uspId);
        this.procesarAlergiasIndividual(datos, loader, this.usuario, false);
      }
      else {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.info.getAlergiasApi(uspId).subscribe((response: any) => {
            console.log(response);
            //correcto
            this.procesarAlergiasIndividual(response, loader, this.usuario, true);
          }, async error => {
            console.log(error.message);
            this.tituloProgressAlergias = '';
            this.estaCargandoAlergias = false;
            loader.dismiss();
          });
        }
        else {
          //llamada nativa
          this.info.getAlergiasNativeApi(uspId).then((response: any) => {
            //this.procesarIndicadorValor(JSON.parse(response.data), loader);
            console.log(JSON.parse(response.data));
            this.procesarAlergiasIndividual(JSON.parse(response.data), loader, this.usuario, true);
          }).catch(async error => {
            console.log(error.message);
            this.tituloProgressAlergias = '';
            this.estaCargandoAlergias = false;
            loader.dismiss();
          });

        }
      }
    });
  }
  async procesarAlergiasIndividual(data, loader, usuarioAps, guardaLocalStorage) {
    //procesamos los datos en el local storage
    if (guardaLocalStorage) {
      var entidad = {
        UsuarioAps: usuarioAps,
        Alergias: null,
      }
      entidad.Alergias = data;
      this.arrAlergias = [];
      if (localStorage.getItem('ALERGIAS')){
        this.arrAlergias = JSON.parse(localStorage.getItem('ALERGIAS'));
      }
      this.arrAlergias.push(entidad);
      localStorage.setItem('ALERGIAS', JSON.stringify(this.arrAlergias));
      localStorage.setItem('FECHA_ACTUALIZACION_ALERGIAS', moment().format('YYYY-MM-DD HH:mm'));
    }
    //fin proceso ********************************
    this.alergias = data.AlergiasUsp;
    if (this.alergias) {
      if (this.alergias.length == 1) {
        this.title = "Alergia";
      } else {
        this.title = "Alergias";
      }
    }
    this.estaCargandoAlergias = false;
    this.tituloProgressAlergias = '';
    if (this.alergias && this.alergias.length > 0){
      this.tieneAlergias = true;
    }
    loader.dismiss();
  }
  async construirArregloMorbidosIndividual(uspId){
    let loader = await this.loading.create({
      cssClass: 'loading-vacio',
      showBackdrop: false,
      spinner: null
    });
    this.estaCargandoMorbidos = true;
    this.tituloProgressMorbidos = 'Buscando otros datos del paciente';
    await loader.present().then(async () => {
      if (this.utiles.necesitaActualizarMorbidosPacientes(uspId) == false){
        var datos = this.utiles.entregaArregloMorbidosPaciente(uspId);
        this.procesarAntecedentesIndividual(datos, loader, null, false);
      }
      else {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.info.postAntecedentesApi(uspId).subscribe((response: any) => {
            console.log(response);
            //correcto
            this.procesarAntecedentesIndividual(response, loader, this.usuario, true);
          }, error => {
            console.log(error.message);
            this.estaCargandoMorbidos = false;
            this.tituloProgressMorbidos = '';
            loader.dismiss();
          });
        }
        else {
          //llamada nativa
          this.info.postAntecedentesNativeApi(uspId).then((response: any) => {
            //this.procesarIndicadorValor(JSON.parse(response.data), loader);
            console.log(JSON.parse(response.data));
            this.procesarAntecedentesIndividual(JSON.parse(response.data), loader, this.usuario, true);
          }).catch(error => {
            console.log(error.message);
            this.estaCargandoMorbidos = false;
            this.tituloProgressMorbidos = '';
            loader.dismiss();
          });

        }
      }
    });
  }
  procesarAntecedentesIndividual(data, loader, usuarioAps, guardaLocalStorage) {
    //procesamos los datos en el local storage
    if (guardaLocalStorage) {
      var entidad = {
        UsuarioAps: usuarioAps,
        Morbidos: null,
      }
      entidad.Morbidos = data;
      this.arrMorbidos = [];
      if (localStorage.getItem('MORBIDOS')){
        this.arrMorbidos = JSON.parse(localStorage.getItem('MORBIDOS'));
      }
      this.arrMorbidos.push(entidad);
      localStorage.setItem('MORBIDOS', JSON.stringify(this.arrMorbidos));
      localStorage.setItem('FECHA_ACTUALIZACION_MORBIDOS', moment().format('YYYY-MM-DD HH:mm'));
    }
    //fin proceso ********************************
    this.antecedentes = data;
    console.log(this.antecedentes);
    this.familiares = [];
    this.personales = [];
    if (this.antecedentes.Antecedentes){
      if (this.antecedentes.Antecedentes.Familiares){
        if (this.antecedentes.Antecedentes.Familiares.Antecedente && this.antecedentes.Antecedentes.Familiares.Antecedente.length > 0){
          let arr = this.antecedentes.Antecedentes.Familiares.Antecedente;
          arr.forEach(ante => {
            let entidad = {
              Nombre: ante
            }
            this.familiares.push(entidad);
          });
        }
      }
      if (this.antecedentes.Antecedentes.Personales){
        if (this.antecedentes.Antecedentes.Personales.Antecedente && this.antecedentes.Antecedentes.Personales.Antecedente.length > 0){
          let arr = this.antecedentes.Antecedentes.Personales.Antecedente;
          arr.forEach(perso => {
            let entidad = {
              Nombre: perso
            }
            this.personales.push(entidad);
          });
        }
      }
    }
    //if (this.personales.length > 0 || this.familiares.len)
    if (this.personales && this.personales.length > 0){
      this.tieneMorbidosPersonales = true;
    }
    if (this.familiares && this.familiares.length > 0){
      this.tieneMorbidosFamiliares = true;
    }
    this.estaCargandoMorbidos = false;
    this.tituloProgressMorbidos = '';
    loader.dismiss();
  }
}
