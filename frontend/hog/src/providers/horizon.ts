import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as zon from '@horizon/client'

/*
  Generated class for the Horizon provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Horizon {
  horizon: any;
  complexList$: any;
  simpleList$: any;
  errors$: any;
  output$: any;
  logs$: any;
  warnings$: any;

  constructor(public http: Http) {
    console.log('Hello Horizon Provider');
    this.horizon = zon({host: 'localhost:8181'})
    this.complexList$ = this.horizon('scripts').order("lastModified").findAll({type: 'complex'}).watch()
    this.simpleList$ = this.horizon('scripts').order("lastModified").findAll({type: 'simple'}).watch()    
  }
  /**
   * Description
   * Filters data coming back by options
   * @method filterBy
   * @param options: {
   * }
   */
  filterBy(options) {
    return this.horizon('scripts').order(options.order).findAll(options.filter);
  }

  save(data) {
    return this.horizon('scripts').update(data)
  }
  create(data) {
    this.horizon('scripts').insert(data)
  }
  remove(id) {
    this.horizon('scripts').remove(id);
  }
  run(id) {
    // no idea how to do this
  }


}
