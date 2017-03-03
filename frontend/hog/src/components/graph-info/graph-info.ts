import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular'
import Chart from 'chart.js'
/*
  Generated class for the GraphInfo component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'graph-info',
  templateUrl: 'graph-info.html'
})
export class GraphInfoComponent {

  graph_data: any;
  script: any;

  graph_layout: any = [];
  indexs: any = [];

  show_graph: boolean = false;
  selectedIndex: number = 1;

  x_location: number = -1;
  x_axis: number = -1;
  y_location: number = -1;
  y_axis: number = 0;

  sliderNum: number;
  slider_max: number;
  graph_type: any;
  total_data: any = {};

  graph_structure: any = {}
  output_selection: any = this.graph_data[0].length
  refreshed_data: boolean = true;

  graph: any = {
    Bar: false,
    Line: false,
    Radar: false
  }
  myNewChart: any;
  ctx: any;
  constructor(public viewCtrl: ViewController, public params: NavParams) {
    console.log('Hello GraphInfo Component');
    this.graph_data = this.params.get('graph_data');
    this.script = this.params.get('script');
  }
  ionViewWillLoad() {
    this.reloadData(() => {
      this.setY(this.indexs[0].value);
    })
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  reloadData(cb) {
    this.graph_structure = {};
    this.graph_data.map((item) => {
      if(this.graph_structure[item.length])
      {
        this.graph_structure[item.length].push(item);
      }
      else
      {
        this.graph_structure[item.length] = [item];
      }
    })
    this.slider_max = this.graph_structure[this.output_selection].length;
    this.sliderNum = (Number(this.slider_max) >= Number(this.script.graph_count) && Number(this.script.graph_count) > 0) ? this.script.graph_count : this.slider_max;
    this.graph_type = this.script.graph_type || "Bar";

    this.graph[this.graph_type] = true;

    if (this.refreshed_data) {
      this.graph_layout = [];
      this.indexs = [];
      this.graph_structure[this.output_selection][0]
        .forEach((item, i) => {
          this.graph_layout.push(i);
          this.indexs.push({
            value: i,
            disabled: false,
          });
          if (i + 1 >= this.graph_structure[this.output_selection][0].length) {
            if(cb) {
              cb();
            }
          }
        })
        this.refreshed_data = false;
    }
  }
  // TODO: Review this
  setX(x_axis) {
    if (x_axis === -1) {
      this.graph_layout[this.x_axis] = this.x_axis;
      this.x_axis = x_axis;
      this.x_location = x_axis;
    }
    else {
      this.graph_layout[this.x_axis] = this.x_axis
      this.x_axis = x_axis;
      this.indexs.map((item, i) => {
        if (Number(item.value) === Number(this.x_axis)) {
          this.graph_layout[i] = "X";
          this.x_location = i;
          if (this.y_location >= 0) {
            this.show_graph = true;
          }
        }
      });
      if (x_axis === this.y_axis) {
        this.y_axis = -1;
        this.y_location = -1;
        this.show_graph = false;
      }
    }
  }
  setY(y_axis) {
    this.graph_layout[this.y_axis] = this.y_axis;
    this.y_axis = y_axis;
    this.indexs.map((item, i) => {
      if (Number(item.value) === Number(this.y_axis)) {
        this.graph_layout[i] = "Y";
        this.y_location = i;
        if (this.y_location >= 0) {
          this.show_graph = true;
        }
      }
    });
    if (y_axis === this.x_axis) {
      this.x_axis = -1;
      this.x_location = -1;
    }
  }
  graphToString() {
    return this.graph_layout.toString();
  }
  showGraph(graph_type) {
    if (this.y_location != -1) {
      if (graph_type) {
        this.graph_type = graph_type;
      }
      if (this.myNewChart) {
        this.myNewChart.destroy();
      }

      let x_data = [];
      let y_data = [];
      this.graph_structure[this.output_selection]
        .forEach((item, i) => {
          if (this.x_location >= 0) {
            x_data.push(item[this.x_location]);
          } else {
            x_data.push(i);
          }
          y_data.push(item[this.y_location])
        })
      this.total_data = {
        labels: x_data.slice(0, this.sliderNum),
        datasets: [{
          labels: x_data.slice(0, this.sliderNum),
          // Blue
          fillColor: "rgba(33,150,243,0.3)",
          strokeColor: "rgba(33,150,243,1)",
          pointColor: "rgba(33,150,243,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(33,150,243,1)",
          data: y_data.slice(0, this.sliderNum)
        }]
      }
      let container = document.getElementById('myChart');
      if (container) {
        this.ctx = container;//.getContext("2d");
        this.myNewChart = new Chart(this.ctx)[this.graph_type](this.total_data);
        this.myNewChart.resize();
      } 
    }
  }
}
