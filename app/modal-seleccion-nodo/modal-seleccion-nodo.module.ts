import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { ModalSeleccionNodoPage } from './modal-seleccion-nodo.page';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ComponentsModule } from '../components/components.module';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ModalSeleccionNodoPage
      }
    ])
  ],
  declarations: [ModalSeleccionNodoPage]
})
export class ModalSeleccionNodoPageModule {}