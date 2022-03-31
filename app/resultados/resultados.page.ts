import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//servicios
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioGeo } from '../../app/services/ServicioGeo';
import { ServicioParametrosApp } from '../../app/services/ServicioParametrosApp';
import { ServicioLaboratorio } from '../../app/services/ServicioLaboratorio';
import { NavigationExtras } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.page.html',
  styleUrls: ['./resultados.page.scss'],
})
export class ResultadosPage implements OnInit {
  resultados;
  nombreExamen;
  usuarioAps;
  tiene = false;
  constructor(
    private navCtrl: NavController,
    public utiles: ServicioUtiles,
    public servicioGeo: ServicioGeo,
    public parametros: ServicioParametrosApp,
    public loading: LoadingController,
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public lab: ServicioLaboratorio
  ) { }

  ngOnInit() {
    moment.locale('es');
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.resultados) {
        this.resultados = JSON.parse(params.resultados);
        if (this.resultados && this.resultados.length > 0){
          this.tiene = true;
        }
        console.log(this.resultados);
      }
      if (params && params.nombreExamen) {
        this.nombreExamen = params.nombreExamen;
        console.log(this.nombreExamen);
      }
      if (params && params.usuario) {
        this.usuarioAps = JSON.parse(params.usuario);
        console.log(this.usuarioAps);
      }
    });
  }
  volver() {
    //this.navCtrl.navigateRoot('nuevo-login');
    const navigationExtras: NavigationExtras = {
      queryParams: {
        usuario: JSON.stringify(this.usuarioAps),
        actualiza: 'false'
      }
    }
    this.navCtrl.navigateRoot(['ordenes'], navigationExtras);
  }

}
