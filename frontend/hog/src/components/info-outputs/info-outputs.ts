import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular'
/*
  Generated class for the InfoOutputs component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'info-outputs',
  templateUrl: 'info-outputs.html'
})
export class InfoOutputsComponent {

  name: string;
  info_outputs: any;
  outputs: any;
  logs: any;
  warnings: any;
  errors: any;
  filter: any;
  graph_data: any;
  id: any;

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    console.log('Hello InfoOutputs Component');
    this.name = this.params.get('name');
    this.info_outputs = this.params.get('info_outputs');
    this.outputs = this.params.get('outputs');
    this.logs = this.params.get('logs');
    this.warnings = this.params.get('warnings');
    this.errors = this.params.get('errors');
    this.filter = this.params.get('filter') || 'all';
    this.graph_data = this.params.get('graph_data');
    this.id = this.params.get('id');
  }
  filteredInfo() {
    return this.info_outputs.filter((info) => {
      if(this.filter === 'all')
      {
        return true;
      }
      else
      {
        return info.type === this.filter;
      }
    })
  }
  filterBy(test: string) {
    this.filter = test;
  }
  dismiss() {
    this.viewCtrl.dismiss()
  }
}
