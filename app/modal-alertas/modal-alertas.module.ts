import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { ModalAlertasPage } from './modal-alertas.page';
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
        component: ModalAlertasPage
      }
    ])
  ],
  declarations: [ModalAlertasPage]
})
export class ModalAlertasPageModule {}