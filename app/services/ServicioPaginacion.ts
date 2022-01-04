import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import * as moment from 'moment';
import { environment } from '../../environments/environment';

@Injectable()
export class ServicioPaginacion{
    pager = {
        TotalPaginas: 0,
        TotalRegistros: 0,
        PaginaSeleccionada: 0,
        Items: [],
        ItemsTotal: [],
        Limite: 10
    }
    constructor(
        public platform : Platform,
        public appVersion: AppVersion,
        public toast: ToastController,
    ){
      //inicializamos los valores
      moment.locale('es');
  
    }
    setPage(page: number){
        if (this.pager.ItemsTotal && this.pager.ItemsTotal.length > 0){
            var startIndex = 0;
            var endIndex = this.pager.Limite;
            if (page > 0){
                this.pager.PaginaSeleccionada = page;
                startIndex = (page * this.pager.Limite) - 1;
                endIndex = startIndex + this.pager.Limite;
            }
            console.log('start ' + startIndex);
            console.log('end ' + endIndex);

            this.pager.Items = [];
            var elementos = this.pager.ItemsTotal.slice(startIndex, endIndex);
            this.pager.Items = elementos;

        }
        console.log(this.pager);
    }
    setDataPages(items){
        if (items != null && items.length > 0){
            var cantidadPaginas = Math.round(items.length / this.pager.Limite);
            console.log(cantidadPaginas);
            this.pager.TotalPaginas = cantidadPaginas;
            this.pager.TotalRegistros = items.length;
            this.pager.ItemsTotal = items;
            console.log(this.pager);
        }
        else{
            //no hay registros
            this.pager.Items = [];
            this.pager.ItemsTotal = [];
            this.pager.PaginaSeleccionada = 0;
            this.pager.TotalPaginas = 0;
            this.pager.TotalRegistros = 0;
        }
    }
}