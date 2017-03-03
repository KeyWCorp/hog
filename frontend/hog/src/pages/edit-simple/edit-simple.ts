import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the EditSimple page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-edit-simple',
  templateUrl: 'edit-simple.html'
})
export class EditSimplePage {
  script: string
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditSimplePage');
  }
  onScriptChange(script) {
    this.script = script;
  }

}
