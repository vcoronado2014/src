import { Component,Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-minimo',
  templateUrl: './progress-minimo.component.html',
  styleUrls: ['./progress-minimo.component.scss'],
})
export class ProgressMinimoComponent implements OnInit {
  @Input() mostrar: boolean = false;
  @Input() titulo: any;
  constructor() { }

  ngOnInit() {}

}