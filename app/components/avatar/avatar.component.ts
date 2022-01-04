import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  @Input() urlImagen: any;
  @Input() nombreCompleto: any;
  @Input() parentezco: any;
  //inset: solo la parte del texto y no avatar full: todo none: ninguna
  @Input() lines = 'none';
  @Input() style = true;
  constructor() { }

  ngOnInit() {
    console.log(this.style);
  }

}
