import { Component, Input } from '@angular/core';

/*
  Generated class for the PigTable component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'pig-table',
  templateUrl: 'pig-table.html'
})
export class PigTableComponent {
  @Input() name: any
  @Input() inputData: any;
  text: string;

  constructor() {
    console.log('Hello PigTable Component');
    this.text = 'Hello World';
  }

}
