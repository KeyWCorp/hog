import { Component, Input } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { InfoOutputsComponent } from '../info-outputs/info-outputs';
import { GraphInfoComponent } from '../graph-info/graph-info'
/*
  Generated class for the ScriptOutput component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'log-output',
  templateUrl: 'script-output.html'
})
export class ScriptOutputComponent {

  @Input() infoOutputs: any;
  @Input() outputs: any;
  @Input() logs: any;
  @Input() warnings: any;
  @Input() errors: any;
  @Input() pigList: any;
  @Input() name: string;
  @Input() script: any;

  info_outputs: any;

  constructor(public modalCtrl: ModalController) {
    console.log('Hello ScriptOutput Component');
    this.info_outputs = this.infoOutputs;
  }
  openInfo(button: Element, filter: string) {
    let modal = this.modalCtrl.create(InfoOutputsComponent, {
      'info_outputs': this.info_outputs,
      outputs: this.outputs,
      logs: this.logs,
      warnings: this.warnings,
      errors: this.errors,
      graph_data: this.pigList,
      filter: filter,
      name: this.name
    });
    modal.present();
  }
  openGraphInfo(button: Element, filter: string) {
    let modal = this.modalCtrl.create(GraphInfoComponent, {
     graph_data: this.pigList,
     script: this.script,
      
    });
    modal.present();
  }
}
