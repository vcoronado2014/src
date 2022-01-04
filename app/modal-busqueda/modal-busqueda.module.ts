import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { ModalBusquedaPage } from './modal-busqueda.page';
import { MatButtonModule } from '@angular/material/button'
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatButtonModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ModalBusquedaPage
      }
    ])
  ],
  declarations: [ModalBusquedaPage]
})
export class ModalBusquedaPageModule {}