import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TextAvatarModule } from '../../directives/text-avatar/index'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { CardCalendarioComponent } from './card-calendario/card-calendario.component'
import { AvatarComponent } from './avatar/avatar.component'
import { ProgressComponent } from './progress/progress.component'
import { ItemHomeComponent } from './item-home/item-home.component'
import { AvatarSimpleComponent } from './avatar-simple/avatar-simple.component'
import { PaginaMensajesComponent } from './pagina-mensajes/pagina-mensajes.component'
import { ContentSlideComponent } from './content-slide/content-slide.component'
import { ProgressMinimoComponent } from './progress-minimo/progress-minimo.component'



@NgModule({
  declarations: [
    CardCalendarioComponent,
    AvatarComponent,
    AvatarSimpleComponent,
    ProgressComponent,
    ItemHomeComponent,
    PaginaMensajesComponent,
    ContentSlideComponent,
    ProgressMinimoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextAvatarModule,
    MatCardModule,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  exports: [
    CardCalendarioComponent,
    AvatarComponent,
    AvatarSimpleComponent,
    ProgressComponent,
    ItemHomeComponent,
    PaginaMensajesComponent,
    ContentSlideComponent,
    ProgressMinimoComponent
  ]
})
export class ComponentsModule { }
