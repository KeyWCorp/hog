import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Pig } from '../../providers/providers'
import { EditComplexPage } from '../edit-complex/edit-complex';
import { EditSimplePage } from '../edit-simple/edit-simple'
//import {ComplexListPage, SimpleListPage, ComplexEditPage, SimpleEditPage } '../pages'

@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage {
  simple: any;
  complex: any;
  simple$: any;
  complex$: any;
  constructor(public navCtrl: NavController, public pig: Pig) {
    
  }
  ionViewWillEnter() {
    this.complex$ = this.pig.getMostRecent(5, 'complex')
    this.complex$.subscribe((items: any) => {
      console.log('5 complex', items);
      this.complex = items.json;
    })
    this.simple$ = this.pig.getMostRecent(5, 'simple')
    this.simple$.subscribe((items: any) => {
      console.log('5 simple', items);
      this.simple = items.json;
    }) 
  }
  ionViewWillExit() {
    this.complex$.unsubscribe();
    this.simple$.unsubscribe();
  }
  getSimpleList() {
    return this.pig.getMostRecent(5, 'simple');
  }
  getComplexList() {
    return this.pig.getMostRecent(5, 'complex');
  }
  goToSimple() {
    //this.navCtrl.push(SimpleListPage)
  }
  goToComplex() {
    //this.navCtrl.push(ComplexListPage)
  }
  editSimple(id) {
    this.navCtrl.push(EditSimplePage, {id: id})
  }
  editComplex(id) {
    this.navCtrl.push(EditComplexPage, {id: id})
  }

  


}
