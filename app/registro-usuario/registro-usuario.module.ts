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

import { RegistroUsuarioPage } from './registro-usuario.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: RegistroUsuarioPage
      }
    ])
  ],
  declarations: [RegistroUsuarioPage]
})
export class RegistroUsuarioPageModule {}