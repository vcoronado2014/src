import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from '../components/components.module';

import { InterconsultasPage } from './interconsultas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: InterconsultasPage
      }
    ])
  ],
  declarations: [InterconsultasPage]
})
export class InterconsultasPageModule {}
