'use strict';

angular.module('hog')
.controller('ListSimpleCtrl', function ($log, $state, Runner, $mdDialog, $mdMedia, $scope,$mdToast,  NgTableParams, $interval)
    {
      var vm = this;

      vm.data = {
        "nodes": [
        {
          "x": 188,
          "y": 43,
          "width": 300,
          "height": 124,
          "name": "new node 0",
          "category": "input",
          "type": "load",
          "params": [
          {
            "name": "source",
            "value": "/Users/kmcoxe/Documents/IPI/test/test.data"
          },
          {
            "name": "format",
            "value": "x"
          }
          ],
          "script": {
            "input_var": false,
            "output_var": true,
            "variables": [
              "source",
              "format"
            ],
            "content": "<output_var> = LOAD '<source>' AS <format>;"
          },
          "output": "load0",
          "fixed": true,
          "index": 0,
          "weight": 1,
          "px": 188,
          "py": 43,
          "output_node": 1
        },
        {
          "x": 393,
          "y": 248,
          "width": 300,
          "height": 124,
          "name": "new node 1",
          "category": "function",
          "type": "count",
          "params": [
          {
            "name": "type",
            "value": "x"
          }
          ],
          "script": {
            "input_var": true,
            "output_var": true,
            "variables": [
              "type"
            ],
            "content": "<output_var><type> = GROUP <input_var> ALL;<output_var> = FOREACH <output_var><type> GENERATE COUNT(<input_var>);"
          },
          "output": "count1",
          "fixed": true,
          "index": 1,
          "weight": 2,
          "px": 393,
          "py": 248,
          "input_node": 0,
          "input": "load0",
          "output_node": 2
        },
        {
          "x": 136,
          "y": 470,
          "width": 300,
          "height": 124,
          "name": "new node 2",
          "category": "output",
          "type": "dump",
          "params": [],
          "script": {
            "input_var": true,
            "output_var": false,
            "variables": [],
            "content": "DUMP <input_var>;"
          },
          "output": "dump2",
          "fixed": true,
          "index": 2,
          "weight": 1,
          "px": 136,
          "py": 470,
          "input_node": 1,
          "input": "count1"
        }
        ],
        "links": [
        {
          "source": {
            "x": 188,
            "y": 43,
            "width": 300,
            "height": 124,
            "name": "new node 0",
            "category": "input",
            "type": "load",
            "params": [
            {
              "name": "source",
              "value": "/Users/kmcoxe/Documents/IPI/test/test.data"
            },
            {
              "name": "format",
              "value": "x"
            }
            ],
            "script": {
              "input_var": false,
              "output_var": true,
              "variables": [
                "source",
                "format"
              ],
              "content": "<output_var> = LOAD '<source>' AS <format>;"
            },
            "output": "load0",
            "fixed": true,
            "index": 0,
            "weight": 1,
            "px": 188,
            "py": 43,
            "output_node": 1
          },
          "target": {
            "x": 393,
            "y": 248,
            "width": 300,
            "height": 124,
            "name": "new node 1",
            "category": "function",
            "type": "count",
            "params": [
            {
              "name": "type",
              "value": "x"
            }
            ],
            "script": {
              "input_var": true,
              "output_var": true,
              "variables": [
                "type"
              ],
              "content": "<output_var><type> = GROUP <input_var> ALL;<output_var> = FOREACH <output_var><type> GENERATE COUNT(<input_var>);"
            },
            "output": "count1",
            "fixed": true,
            "index": 1,
            "weight": 2,
            "px": 393,
            "py": 248,
            "input_node": 0,
            "input": "load0",
            "output_node": 2
          }
        },
        {
          "source": {
            "x": 393,
            "y": 248,
            "width": 300,
            "height": 124,
            "name": "new node 1",
            "category": "function",
            "type": "count",
            "params": [
            {
              "name": "type",
              "value": "x"
            }
            ],
            "script": {
              "input_var": true,
              "output_var": true,
              "variables": [
                "type"
              ],
              "content": "<output_var><type> = GROUP <input_var> ALL;<output_var> = FOREACH <output_var><type> GENERATE COUNT(<input_var>);"
            },
            "output": "count1",
            "fixed": true,
            "index": 1,
            "weight": 2,
            "px": 393,
            "py": 248,
            "input_node": 0,
            "input": "load0",
            "output_node": 2
          },
          "target": {
            "x": 136,
            "y": 470,
            "width": 300,
            "height": 124,
            "name": "new node 2",
            "category": "output",
            "type": "dump",
            "params": [],
            "script": {
              "input_var": true,
              "output_var": false,
              "variables": [],
              "content": "DUMP <input_var>;"
            },
            "output": "dump2",
            "fixed": true,
            "index": 2,
            "weight": 1,
            "px": 136,
            "py": 470,
            "input_node": 1,
            "input": "count1"
          }
        }
        ],
        "script": "load0 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' AS x;count1x = GROUP load0 ALL;count1 = FOREACH count1x GENERATE COUNT(load0);DUMP count1;"
      };

      vm.ots = function (d)
      {
        return JSON.stringify(d);
      }

      vm.update = function (d)
      {
        console.log(JSON.stringify(d, null, 2));
      };


      angular.extend(vm, {
        name: 'ListComplexCtrl',
      });
    });
