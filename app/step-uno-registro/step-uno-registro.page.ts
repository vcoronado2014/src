import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { NavigationExtras } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-step-uno-registro',
  templateUrl: './step-uno-registro.page.html',
  styleUrls: ['./step-uno-registro.page.scss'],
})
export class StepUnoRegistroPage implements OnInit {
  rut;
  cargando = false;
  registroIncompleto: any;
  //formulario
  forma: FormGroup;
  //expresiones regulares
  //expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  expEmail = /^((\w[^\W]+)[\.\-]?){1,}\@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gm
  tipoMovimiento = '1';
  estaAgregandoFamilia = false;
  paginaAnterior = 'nuevo-login';
  //para mostrar la pagina de mensajes
  muestraMensaje = false;
  objetoMensaje = {
    irA: 'inicio',
    titulo: '',
    contenido: ''
  }



  constructor(
    private navCtrl: NavController,
    public utiles: ServicioUtiles,
    public servicioGeo: ServicioGeo,
    public parametros: ServicioParametrosApp,
    public loading: LoadingController,
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) {

  }

  ngOnInit() {
    moment.locale('es');
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.estaAgregandoFamilia) {
        this.estaAgregandoFamilia = true;
      }
      if (params && params.modulo) {
        this.paginaAnterior = params.modulo;
      }
    });
    this.cargarForma();
  }
  cargarForma() {
    this.forma = new FormGroup({
      'run': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required, Validators.email]),
      'nombre': new FormControl('', [Validators.required])
    }, { validators: this.RunValidator });

  }

  volver() {
    if (this.paginaAnterior) {
      this.navCtrl.navigateRoot(this.paginaAnterior);
    }
    else {
      this.navCtrl.navigateRoot('nuevo-login');
    }
  }
  //para validar
  get f() { return this.forma.controls; }

  irPreguntas() {
    //console.log('ir a preeguntas');
    const navigationExtras: NavigationExtras = {
      queryParams: {
        nombre: this.forma.controls.nombre.value,
        run: this.forma.controls.run.value,
        email: this.forma.controls.email.value,
        modulo: 'step-uno-registro'
      }
    };
    this.navCtrl.navigateRoot(['validacion-registro'], navigationExtras);
  }
  irPreguntasNew() {
    // Validar el correo antes de continuar
    this.validarCorreoNew().then(() => {
      // Si la validación del correo es exitosa, continuar con irPreguntas()
      const navigationExtras: NavigationExtras = {
        queryParams: {
          nombre: this.forma.controls.nombre.value,
          run: this.forma.controls.run.value,
          email: this.forma.controls.email.value,
          modulo: 'step-uno-registro'
        }
      };
      this.navCtrl.navigateRoot(['validacion-registro'], navigationExtras);
    }).catch(error => {
      console.error('Error en la validación del correo:', error);
      // Manejar el error de validación del correo aquí si es necesario
    });
  }
  
  async validarCorreo(event) {
    //let correo = event.target.value;
    //console.log(event);
    
    let correo = this.forma.controls.email.value;
    if (correo == '' || correo == undefined || this.f.email.errors){
      return;
    }

    let loader = await this.loading.create({
      message: 'Verificando...<br>Correo electrónico',
      duration: 3000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.servicioGeo.postValidarCorreo(correo).subscribe((response: any) => {
          //procesar
          if (response && response.CodigoMensaje != 0) {
            this.utiles.presentToast(response.Mensaje, "middle", 3000);
            this.forma.controls.email.setValue('');
          }
        })
      }
      else {
        //llamada nativa
        this.servicioGeo.postValidarCorreoNative(correo).then((response: any) => {
          //procesar JSON.parse(response.data)
          var responseData = JSON.parse(response.data);
          if (response && response.CodigoMensaje != 0) {
            this.utiles.presentToast(response.Mensaje, "middle", 3000);
            this.forma.controls.email.setValue('');
          }
        },
          (error) => {
            this.utiles.presentToast('Ocurrió un al procesar.', 'bottom', 4000);
          }
        );
      }
    });

  }

  async validarCorreoNew() {
    let correo = this.forma.controls.email.value;
    if (correo == '' || correo == undefined || this.f.email.errors) {
      return Promise.resolve(); // No realizar la validación si el correo está vacío o tiene errores
    }
  
    let loader = await this.loading.create({
      message: 'Verificando...<br>Correo electrónico',
      duration: 3000
    });
  
    await loader.present();
    
    if (!this.utiles.isAppOnDevice()) {
      // Llamada web
      return new Promise<void>((resolve, reject) => {
        this.servicioGeo.postValidarCorreo(correo).subscribe((response: any) => {
          // Procesar
          if (response && response.CodigoMensaje != 0) {
            this.utiles.presentToast(response.Mensaje, "bottom", 3000);
            this.forma.controls.email.setValue('');
            reject('Correo no válido');
          } else {
            resolve();
          }
        }, error => {
          reject(error);
        });
      });
    } else {
      // Llamada nativa
      return new Promise<void>((resolve, reject) => {
        this.servicioGeo.postValidarCorreoNative(correo).then((response: any) => {
          // Procesar JSON.parse(response.data)
          var responseData = JSON.parse(response.data);
          if (response && response.CodigoMensaje != 0) {
            this.utiles.presentToast(response.Mensaje, "bottom", 3000);
            this.forma.controls.email.setValue('');
            reject('Correo no válido');
          } else {
            resolve();
          }
        }, error => {
          reject(error);
        });
      });
    }
  }


  abrirLogin() {
    this.navCtrl.navigateRoot('nuevo-login');
  }

  RunValidator: ValidatorFn = (fg: FormGroup) => {
    const run = fg.get('run').value;
    if (run !== null && run !== "") {
      if (this.utiles.Rut(run) == false) {
        this.forma.controls.run.setErrors({ runInvalido: false });
      }
    }

    return run !== null ? null : null;
  };

}