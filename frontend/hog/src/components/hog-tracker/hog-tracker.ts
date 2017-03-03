import { Component } from '@angular/core';

/*
  Generated class for the HogTracker component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'hog-tracker',
  templateUrl: 'hog-tracker.html'
})
export class HogTrackerComponent {

  text: string;

  constructor() {
    console.log('Hello HogTracker Component');
    this.text = 'Hello World';
  }

}
