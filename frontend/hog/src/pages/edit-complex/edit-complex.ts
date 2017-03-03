import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Pig } from '../../providers/providers'
import * as FileSaver from 'file-saver'
/*
  Generated class for the EditComplex page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-edit-complex',
  templateUrl: 'edit-complex.html'
})
export class EditComplexPage {
  version: any;
  versions: any;
  script: any;
  info_outputs: any = [];
  outputs: any = [];
  logs: any = [];
  warnings: any = [];
  errors: any = [];
  id: any = [];

  script_data: any;
  script_args: any;
  script_name: any;

  taskList: any = [];
  pigList: any = [];

  running: boolean = false;
  hasData: boolean = false;

  progress: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,public toastCtrl: ToastController, public runner: Pig) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditComplexPage');
    this.runner.error$.subscribe((error) => {
      let toast = this.toastCtrl.create({
        message: error,
        duration: 3000,
      });
      toast.present();
    });
    
    this.runner.getOne(this.navParams.get('id')).take(1)
      .subscribe((data) => {
        this.script = data;//.json;
      })

    this.runner.run$().filter((message) => {
      return message.type == 'progress'
    }).subscribe((message) => {this.progress = message.data.json})
    this.runner.run$().filter((message) => {
      return message.type == 'log' && message.data.json != "null";
    }).subscribe((message) => {
      this.logs.push(message.data.json);
      this.info_outputs.push({data: message.data.json, type: message.type, color: {color: 'blue.400'}});
    });
    this.runner.run$().filter((message) => {
      return message.type == 'warning' && message.data.json != "null";
    }).subscribe((message) => {
      this.warnings.push(message.data.json);
      this.info_outputs.push({data: message.data.json, type: message.type, color: {color: 'orange.400'}});
    })
    
    this.runner.run$().filter((message) => {
      return message.type == 'output' && message.data.json != "null";
    }).subscribe((message) => {
      this.outputs.push(message.data.json);
      this.info_outputs.push({data: message.data.json, type: message.type, color: {color: 'green.400'}});
      this.parseOutput(message.data.json, this.pigList)
    })
    this.runner.run$().filter((message) => {
      return message.type == 'error' && message.data.json != "null";
    }).subscribe((message) => {
      this.errors.push(message.data.json);
      this.info_outputs.push({data: message.data.json, type: message.type, color: {color: 'red.400'}});
    })
  }
  downloadScript() {
    let data = new Blob([this.script.data], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(data, this.script.name + '.pig');
  }
  deleteScript() {
    // TODO: Add confirm
  }
  save(graph, numOutput) {
    if (this.script.type === 'simple') {
      this.script._id = null;
      this.script.nodes = [];
      this.script.links = [];
      this.script.type = 'complex';
      this.script.data = this.script_data;
      this.script.args = this.script_args.split(" ");
      this.script.graph_type = graph || this.script.graph_type;
      this.script.graph_count = numOutput || this.script.graph_count;
      this.script.name = this.script_name.replace(/[\s,\.]/g, "_") + "_complex";

      this.runner.create(this.script).take(1)
        .subscribe((data) => {
          this.script = data//.json;
          let toast = this.toastCtrl.create({
            message: 'Script Saved',
            duration: 3000,
            position: 'top'
          })
          toast.present();
        })
    }
    else {
      this.script.type = 'complex';
      this.script.data = this.script_data;
      this.script.args = this.script_args.split(" ");
      this.script.graph_type = graph || this.script.graph_type;
      this.script.graph_count = numOutput || this.script.graph_count;
      this.script.name = this.script_name.replace(/[\s,\.]/g, "_") + "_complex";
      this.runner.update(this.script).take(1)
        .subscribe((data) => {
          this.script = data//.json;
          this.script_args = this.script.args.join(" ");
          this.script_name = this.script.name;

          // Filter by version
          this.versions = this.script.history

          this.version = this.script.version;

          let toast = this.toastCtrl.create({
                message: 'Script Saved',
                duration: 3000,
                position: 'top'
              })
              toast.present();
        });
    }
  }
  saveAndRun() {
    this.save(null, null);
    this.run();
  }
  // TODO: Maybe have the return value captured
  kill() {
    this.runner.kill(this.script._id);
  }
  run() {
    this.runner.run(this.script._id)
    this.running = true;
  }
  parseOutput(data, myList) {
    let failed = false;
    let output_data;
    try
    {
      let tmp_data = data
        .replace(/\(/g, "[")
        .replace(/\)/g, "]")
        .replace(/(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|([\w\.]+))/g, '"$1$2"');

      output_data = JSON.parse(tmp_data);
    }
    catch (err)
    {
      failed = true;
    }
    finally
    {
      if (!failed)
      {
        myList.push(output_data);
      }
    }
  }
}
