import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar-simple',
  templateUrl: './avatar-simple.component.html',
  styleUrls: ['./avatar-simple.component.scss'],
})
export class AvatarSimpleComponent implements OnInit {
  @Input() nombreCompleto: any;
  @Input() parentezco: any;
  constructor() { }

  ngOnInit() {}

}
