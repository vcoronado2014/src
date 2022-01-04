import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { PreTiposatencionPage } from './pre-tiposatencion.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatFormFieldModule,
    MatSelectModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PreTiposatencionPage
      }
    ])
  ],
  declarations: [PreTiposatencionPage]
})
export class PreTiposatencionPageModule {}
