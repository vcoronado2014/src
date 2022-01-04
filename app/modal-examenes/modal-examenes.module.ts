import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule } from '@angular/router';

import { ModalExamenesPage } from './modal-examenes.page';
import { TextAvatarModule } from '../../directives/text-avatar/index'
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextAvatarModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ModalExamenesPage
      }
    ])
  ],
  declarations: [ModalExamenesPage]
})
export class ModalExamenesPageModule {}
