import { Component,Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
})
export class ProgressComponent implements OnInit {
  @Input() mostrar: boolean = false;
  @Input() titulo: any;
  constructor() { }

  ngOnInit() {}

}
