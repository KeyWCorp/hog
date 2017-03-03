import { Component, Output, Input, ViewChild, EventEmitter } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular'

/*
  Generated class for the SimpleForm component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'simple-input-edit',
  template: `<ion-list>
    <ion-item>
      <ion-label floating>Variable Name:</ion-label>
      <ion-input [(ngModel)]="input"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label floating>Load Path:</ion-label>
      <ion-input [(ngModel)]="loadPath"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label floating>Format:</ion-label>
      <ion-input [(ngModel)]="format"></ion-input>
    </ion-item>
    <button ion-button (click)="save()"></button>
    <button ion-button (click)="cancel()"></button>
    <ion-item>
    </ion-list>
    <div>
      <p> {{input}} = LOAD {{loadPath}} AS {{format}} </p>
    </div>`
})
class SimplePopUpComponent {
 // @Input() inputType: any;
  //@Output() output: any;
  inputType: any;
  output: any;
  input: any;
  loadPath: any;
  format: any;

  constructor(public viewCtrl: ViewController) {

  }
  save() {
    this.viewCtrl.dismiss({
      input: this.input,
      loadPath: this.loadPath,
      format: this.format})
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
}

@Component({
  selector: 'simple-form',
  templateUrl: 'simple-form.html'
})
export class SimpleFormComponent {

  @Input() text: string;
   
  @Output() script = new EventEmitter<string>();

  input: any;
  action: any;
  output: any;

  inputOptions: any;
  actionOptions: any;
  outputOptions: any;

  variables: any = [];
  constructor(public modalCtrl: ModalController) {
    console.log('Hello SimpleForm Component');
    this.text = 'Hello World';
    this.inputOptions =[{
      name: 'Load',
      source: '/test',
      format: 'CSV',
      content: 'load0 = LOAD ./test as CSV' //`load0 = LOAD ${source} AS ${format}`
    }]
    this.actionOptions = [{
      name: 'Group',
      source: 'noidea',
      format: 'maybe',
      content: 'GROUP load0 BY noidea AS group0'
    }]
    this.outputOptions = [{
      name: 'Dump',
      source: 'group0',
      format: 'maybe',
      content: 'DUMP group0'
    }]


  }
  inputSelected() {
   let inputSelection =  this.modalCtrl.create(SimplePopUpComponent)
   inputSelection.onDidDismiss((data) => {
     console.log('input data: ', data)
     this.variables.push(data.input);
   })
  
  }
  actionSelected() {

  }
  outputSelected() {

  }
  save() {
    this.buildScript();
  }
  buildScript() {
    let outSript = '';
    this.script.emit(outSript)
  }
  run() {

  }
  download() {

  }
}
