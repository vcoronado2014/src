import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { InicioPage } from './inicio.page';
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InicioPage
      }
    ])
  ],
  declarations: [InicioPage]
})
export class InicioPageModule {}
