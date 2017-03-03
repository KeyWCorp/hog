import { Component, Input, Output } from '@angular/core';

/*
  Generated class for the VersionDiff component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'version-diff',
  templateUrl: 'version-diff.html'
})
export class VersionDiffComponent {
  @Input() version: any;
  
  @Input() history: any;
  text: string;

  constructor() {
    console.log('Hello VersionDiff Component');
    this.text = 'Hello World';
  }

}
