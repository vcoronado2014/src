import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ValidacionFactorPage } from './validacion-factor.page';
import { TextAvatarModule } from '../../directives/text-avatar/index'
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    IonicModule,
    TextAvatarModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ValidacionFactorPage
      }
    ])
  ],
  declarations: [ValidacionFactorPage]
})
export class ValidacionFactorPageModule {}
