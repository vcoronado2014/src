import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { CalendarioPage } from './calendario.page';
import { TextAvatarModule } from '../../directives/text-avatar/index'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextAvatarModule,
    MatCardModule,
    MatButtonModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: CalendarioPage
      }
    ]),
  ],
  declarations: [CalendarioPage]
})
export class CalendarioPageModule {}
