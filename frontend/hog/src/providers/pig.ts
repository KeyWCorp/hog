import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEventPattern'
import * as io from 'socket.io-client';

/*
  Generated class for the Pig provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Pig {
  private url = 'http://localhost:9000'
  private namespace = '/api/pigs'
  private socket;

  public list$: Observable<any>;
  public simpleList$: Observable<any>;
  public error$: Observable<any>;
  public bumped$: Observable<any>;
  public saved$: Observable<any>;
  constructor() {
    console.log('Hello Pig Provider');
    this.socket = io(this.url + this.namespace);
    this.list$ = this.list();
    this.simpleList$ = this.simpleList();
    this.error$ = this.error();
    this.bumped$ = this.bumped();
    this.saved$ = Observable.fromEventPattern(
      h => this.socket.on('saved',h),
      rh => {}
    );
  }
  
  private list() {
    let observable = new Observable(observer => { 
      this.socket.emit('index');
      this.socket.on('index', 
        (data) => { 
          observer.next({type: 'list', data: data}); 
        }); 
        return () => { 
          this.socket.disconnect(); 
        }; 
      }) 
      return observable;
  }
  private simpleList() {
    let observable = new Observable(observer => {
      this.socket.emit('simpleIndex');
      this.socket.on('simpleIndex', (data) => {
        observer.next({type: 'list', data: data});
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }
  private error() {
    let observable = new Observable(observer => {
      this.socket.on('error', (err) => {
        observer.next(err);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }
  private bumped() {
    return Observable.fromEventPattern(
      h => this.socket.on('bumped',h),
      rh => {}
    );
  }
  run$() {
    let end$ = Observable.fromEventPattern(
      h => this.socket.on('run:end', h),
      rh => {},
      data => {return {type: 'end', data: data}}
    );
    let progress$ = Observable.fromEventPattern(
      h => this.socket.on('run:progress', h),
      rh => {},
      data => {return {type: 'progress', data: data}}
    )
     let log$ = Observable.fromEventPattern(
      h => this.socket.on('run:log', h),
      rh => {},
      data => {return {type: 'log', data: data}}
    )
     let warning$ = Observable.fromEventPattern(
      h => this.socket.on('run:warning', h),
      rh => {},
      data => {return {type: 'warning', data: data}}
    )
     let output$ = Observable.fromEventPattern(
      h => this.socket.on('run:output', h),
      rh => {},
      data => {return {type: 'output', data: data}}
    )
    return Observable.concat(end$, progress$, log$, warning$, output$)
  }
  /***** */
  create(procData) {
    this.socket.emit('create', procData)
    return Observable.fromEventPattern(
      h => this.socket.on('server:create', h),
      rh => {}
    );
  }
  update(procData) {
    this.socket.emit('update', {
      id: procData._id,
      obj: procData
    })
    return Observable.fromEventPattern(
      h => this.socket.on('update', h),
      rh => {}
    );
  }
  destroy(id) {
    this.socket.emit('destroy', id);
  }
  getOne(id) {
    this.socket.emit('show', id)
    return Observable.fromEventPattern(
        h => this.socket.on('show', h),
        rh => {});
  }
  kill(id) {
    this.socket.emit('kill', id);
  }  
  run(id) {
    this.socket.emit('run', id);
  }
  runAndTrack(id) {
    this.socket.emit('run:track', id);
  }
  getMostRecent(_count, _type) {
    this.socket.emit('recent', {
      count: _count,
      type: _type
    })
    return Observable.fromEventPattern(
      h => this.socket.on('recents-'+_type,h),
      rh => {}
    );
  }
  bump(id) {
    this.socket.emit('bump')
  }
  save(data) {
    this.socket.emit('save', data);
  }
}
